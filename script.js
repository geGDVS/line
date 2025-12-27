// 全局变量
let lineChart = null;
let currentTab = 'slopeIntercept';

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化Tailwind配置
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    primary: '#3b82f6',
                    secondary: '#64748b',
                    accent: '#10b981',
                    warning: '#f59e0b',
                    danger: '#ef4444',
                    light: '#f8fafc',
                    dark: '#1e293b'
                },
                fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                },
            }
        }
    };

    // 初始化图表
    initChart();
    
    // 绑定事件处理程序
    bindEvents();
    
    // 初始计算
    calculateAndUpdate();
});

// 初始化图表
function initChart() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    // 销毁现有图表（如果有）
    if (lineChart) {
        lineChart.destroy();
    }
    
    // 创建新图表
    lineChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    type: 'line',
                    label: '直线',
                    data: generateLinePoints(2, 1),
                    borderColor: '#3b82f6',
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0,
                    fill: false
                },
                {
                    type: 'scatter',
                    label: '关键点',
                    data: [
                        {x: 0, y: 1}, // y截距
                        {x: -0.5, y: 0}, // x截距
                        {x: 1, y: 3} // 示例点
                    ],
                    backgroundColor: '#ef4444',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    type: 'line',
                    label: '方向向量',
                    data: [{x: 1, y: 3}, {x: 2, y: 5}],
                    borderColor: '#10b981',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 4,
                    pointBackgroundColor: '#10b981',
                    fill: false
                },
                {
                    type: 'line',
                    label: '法向量',
                    data: [{x: 1, y: 3}, {x: 3, y: 2}],
                    borderColor: '#f59e0b',
                    borderWidth: 2,
                    borderDash: [3, 3],
                    pointRadius: 4,
                    pointBackgroundColor: '#f59e0b',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    min: -10,
                    max: 10,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        stepSize: 1
                    }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    min: -10,
                    max: 10,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `(${context.parsed.x.toFixed(1)}, ${context.parsed.y.toFixed(1)})`;
                        }
                    }
                },
                legend: {
                    position: 'top'
                }
            }
        }
    });
    
    // 鼠标移动时显示坐标
    const canvas = document.getElementById('lineChart');
    const coordInfo = document.getElementById('coordInfo');
    const coordX = document.getElementById('coordX');
    const coordY = document.getElementById('coordY');
    
    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 将像素坐标转换为图表坐标
        const chartX = lineChart.scales.x.getValueForPixel(x);
        const chartY = lineChart.scales.y.getValueForPixel(y);
        
        coordX.textContent = chartX.toFixed(1);
        coordY.textContent = chartY.toFixed(1);
        coordInfo.style.display = 'block';
    });
    
    canvas.addEventListener('mouseleave', function() {
        coordInfo.style.display = 'none';
    });
}

// 生成直线上的点
function generateLinePoints(m, b) {
    const points = [];
    // 生成从x=-10到x=10的点
    for (let x = -10; x <= 10; x += 0.5) {
        points.push({
            x: x,
            y: m * x + b
        });
    }
    return points;
}

// 生成垂直直线的点
function generateVerticalLinePoints(a) {
    const points = [];
    for (let y = -10; y <= 10; y += 0.5) {
        points.push({
            x: a,
            y: y
        });
    }
    return points;
}

// 生成水平直线的点
function generateHorizontalLinePoints(b) {
    const points = [];
    for (let x = -10; x <= 10; x += 0.5) {
        points.push({
            x: x,
            y: b
        });
    }
    return points;
}

// 绑定所有事件处理程序
function bindEvents() {
    // 选项卡切换
    document.querySelectorAll('#inputTabs button').forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有选项卡的激活状态
            document.querySelectorAll('#inputTabs button').forEach(btn => {
                btn.classList.remove('text-primary', 'border-primary');
                btn.classList.add('text-secondary', 'border-transparent');
            });
            
            // 设置当前选项卡为激活状态
            this.classList.remove('text-secondary', 'border-transparent');
            this.classList.add('text-primary', 'border-primary');
            
            // 隐藏所有内容区域
            document.querySelectorAll('.input-tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            
            // 显示当前选项卡的内容
            currentTab = this.getAttribute('data-tab');
            document.getElementById(`${currentTab}Tab`).classList.remove('hidden');
        });
    });
    
    // 计算按钮点击事件
    document.getElementById('calculateBtn').addEventListener('click', calculateAndUpdate);
    
    // 示例按钮点击事件
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const example = this.getAttribute('data-example');
            loadExample(example);
        });
    });
}

// 加载示例
function loadExample(exampleNum) {
    switch(exampleNum) {
        case '1':
            // y = 2x + 1
            currentTab = 'slopeIntercept';
            document.getElementById('slope').value = 2;
            document.getElementById('intercept').value = 1;
            break;
        case '2':
            // y = -x + 3
            currentTab = 'slopeIntercept';
            document.getElementById('slope').value = -1;
            document.getElementById('intercept').value = 3;
            break;
        case '3':
            // 垂直直线 x=2
            currentTab = 'general';
            document.getElementById('genA').value = 1;
            document.getElementById('genB').value = 0;
            document.getElementById('genC').value = -2;
            break;
        case '4':
            // 水平直线 y=-1
            currentTab = 'slopeIntercept';
            document.getElementById('slope').value = 0;
            document.getElementById('intercept').value = -1;
            break;
    }
    calculateAndUpdate();
}

// 计算并更新所有内容
function calculateAndUpdate() {
    let m, b, x0, y0, x1, y1, x2, y2, a, yInterceptVal, dirU, dirV, norA, norB, genA, genB, genC;
    
    // 根据当前选项卡获取参数并转换为斜截式
    switch(currentTab) {
        case 'slopeIntercept':

            console.log('Calculating from slope-intercept form');

            m = parseFloat(document.getElementById('slope').value);
            b = parseFloat(document.getElementById('intercept').value);
            break;
            
        case 'pointSlope':
            m = parseFloat(document.getElementById('psSlope').value);
            x0 = parseFloat(document.getElementById('px0').value);
            y0 = parseFloat(document.getElementById('py0').value);
            b = y0 - m * x0;
            break;
            
        case 'twoPoints':
            x1 = parseFloat(document.getElementById('x1').value);
            y1 = parseFloat(document.getElementById('y1').value);
            x2 = parseFloat(document.getElementById('x2').value);
            y2 = parseFloat(document.getElementById('y2').value);
            if (x2 === x1) {
                m = Infinity; // 垂直直线
                b = -x1; // x = x1 → x - x1 = 0
            } else {
                m = (y2 - y1) / (x2 - x1);
                b = y1 - m * x1;
            }
            break;
            
        case 'intercept':
            a = parseFloat(document.getElementById('xIntercept').value);
            yInterceptVal = parseFloat(document.getElementById('yIntercept').value);
            if (a === 0) {
                m = Infinity; // 垂直y轴
                b = 0;
            } else {
                m = -yInterceptVal / a;
                b = yInterceptVal;
            }
            break;
            
        case 'direction':
            // 点方向式转换为斜截式
            x0 = parseFloat(document.getElementById('dirX0').value);
            y0 = parseFloat(document.getElementById('dirY0').value);
            dirU = parseFloat(document.getElementById('dirU').value);
            dirV = parseFloat(document.getElementById('dirV').value);
            
            if (dirU === 0) {
                m = Infinity; // 垂直直线
                b = -x0;
            } else {
                m = dirV / dirU;
                b = y0 - m * x0;
            }
            break;
            
        case 'normal':
            // 点法向式转换为斜截式
            x0 = parseFloat(document.getElementById('norX0').value);
            y0 = parseFloat(document.getElementById('norY0').value);
            norA = parseFloat(document.getElementById('norA').value);
            norB = parseFloat(document.getElementById('norB').value);
            
            if (norB === 0) {
                m = Infinity; // 垂直直线
                b = -x0;
            } else {
                m = -norA / norB;
                b = (norA * x0 + norB * y0) / norB;
            }
            break;
            
        case 'general':
            // 一般式转换为斜截式
            genA = parseFloat(document.getElementById('genA').value);
            genB = parseFloat(document.getElementById('genB').value);
            genC = parseFloat(document.getElementById('genC').value);
            
            if (genB === 0) {
                m = Infinity; // 垂直直线
                b = genC / genA;
            } else {
                m = -genA / genB;
                b = -genC / genB;
            }
            break;
    }

    console.log(`Calculated parameters: m=${m}, b=${b}`);
    
    // 更新图表
    updateChart(m, b);
    
    // 计算各种形式（包括新增的点方向式/点法向式/一般式）
    calculateEquationForms(m, b);
}

// 更新图表
function updateChart(m, b) {
    let linePoints, keyPoints = [], dirVectorPoints = [], normalVectorPoints = [];
    const fixedPointX = 1, fixedPointY = 3; // 固定参考点
    
    console.log(`Updating chart with m=${m}, b=${b}`);

    // 处理特殊情况
    if (m === Infinity) {
        // 垂直直线 x = -b
        const xIntercept = -b;
        linePoints = generateVerticalLinePoints(xIntercept);
        // 添加关键点
        for (let y = -10; y <= 10; y += 2) {
            keyPoints.push({x: xIntercept, y: y});
        }
        // 方向向量 (0,1)，法向量 (1,0)
        dirVectorPoints = [{x: xIntercept, y: 0}, {x: xIntercept, y: 2}];
        normalVectorPoints = [{x: xIntercept, y: 0}, {x: xIntercept + 2, y: 0}];
    } else if (m === 0) {
        // 水平直线 y = b
        linePoints = generateHorizontalLinePoints(b);
        keyPoints.push({x: 0, y: b}); // y截距
        if (b !== 0) keyPoints.push({x: -b/m, y: 0}); // x截距
        // 方向向量 (1,0)，法向量 (0,1)
        dirVectorPoints = [{x: 0, y: b}, {x: 2, y: b}];
        normalVectorPoints = [{x: 0, y: b}, {x: 0, y: b + 2}];
    } else {
        // 普通直线
        linePoints = generateLinePoints(m, b);
        // 关键点：x截距、y截距、参考点
        keyPoints.push({x: 0, y: b}); // y截距
        keyPoints.push({x: -b/m, y: 0}); // x截距
        keyPoints.push({x: fixedPointX, y: m * fixedPointX + b}); // 参考点
        
        // 方向向量：(1, m)
        const dirEndX = fixedPointX + 1;
        const dirEndY = (m * fixedPointX + b) + m;
        dirVectorPoints = [{x: fixedPointX, y: m * fixedPointX + b}, {x: dirEndX, y: dirEndY}];
        
        // 法向量：(m, -1)
        const norEndX = fixedPointX + m;
        const norEndY = (m * fixedPointX + b) - 1;
        normalVectorPoints = [{x: fixedPointX, y: m * fixedPointX + b}, {x: norEndX, y: norEndY}];
    }
    
    // 更新图表数据
    lineChart.data.datasets[0].data = linePoints;
    lineChart.data.datasets[1].data = keyPoints;
    lineChart.data.datasets[2].data = dirVectorPoints; // 方向向量
    lineChart.data.datasets[3].data = normalVectorPoints; // 法向量
    lineChart.update();
}

// 计算并显示各种方程形式（含点方向式/点法向式/一般式）
function calculateEquationForms(m, b) {
    // 基础参数计算
    const xInterceptVal = m === 0 ? '无' : (m === Infinity ? -b : (-b / m).toFixed(1));
    const yInterceptVal = m === Infinity ? '无' : b.toFixed(1);
    const angle = m === Infinity ? '90°' : (m === 0 ? '0°' : (Math.atan(m) * 180 / Math.PI).toFixed(1) + '°');
    
    // 方向向量和法向量计算
    let dirVector, normalVector;
    if (m === Infinity) {
        dirVector = '(0, 1)';
        normalVector = '(1, 0)';
    } else if (m === 0) {
        dirVector = '(1, 0)';
        normalVector = '(0, 1)';
    } else {
        // 方向向量 (1, m)，法向量 (m, -1)
        dirVector = `(1, ${m.toFixed(1)})`;
        normalVector = `(${m.toFixed(1)}, -1)`;
    }
    
    // 更新基础参数显示
    document.getElementById('slopeResult').textContent = m === Infinity ? '不存在' : m.toFixed(1);
    document.getElementById('xInterceptResult').textContent = xInterceptVal;
    document.getElementById('yInterceptResult').textContent = yInterceptVal;
    document.getElementById('angleResult').textContent = angle;
    document.getElementById('directionVectorResult').textContent = dirVector;
    document.getElementById('normalVectorResult').textContent = normalVector;
    
    // 固定参考点 (1, m*1 + b)
    const refX = 1;
    const refY = m === Infinity ? 0 : (m * refX + b);
    
    // 处理特殊情况
    if (m === Infinity) {
        // 垂直直线
        const xVal = -b;
        document.getElementById('slopeInterceptResult').textContent = `x = ${xVal}`;
        document.getElementById('pointSlopeResult').textContent = `x = ${xVal}`;
        document.getElementById('twoPointsResult').textContent = `x = ${xVal}`;
        document.getElementById('interceptResult').textContent = `x = ${xVal}`;
        document.getElementById('directionResult').textContent = `(x-${xVal})/0 = (y-0)/1`;
        document.getElementById('normalResult').textContent = `1(x-${xVal}) + 0(y-0) = 0`;
        document.getElementById('generalResult').textContent = `x - ${xVal} = 0`;
    } else if (m === 0) {
        // 水平直线
        document.getElementById('slopeInterceptResult').textContent = `y = ${b.toFixed(1)}`;
        document.getElementById('pointSlopeResult').textContent = `y - ${b.toFixed(1)} = 0(x - 0)`;
        document.getElementById('twoPointsResult').textContent = `(y-${b.toFixed(1)})/0 = (x-0)/1`;
        document.getElementById('interceptResult').textContent = b === 0 ? '不适用 (经过原点)' : `y = ${b.toFixed(1)}`;
        document.getElementById('directionResult').textContent = `(x-${refX})/1 = (y-${refY.toFixed(1)})/0`;
        document.getElementById('normalResult').textContent = `0(x-${refX}) + 1(y-${refY.toFixed(1)}) = 0`;
        document.getElementById('generalResult').textContent = `y - ${b.toFixed(1)} = 0`;
    } else {
        // 普通直线
        // 斜截式
        let slopeIntercept = 'y = ';
        if (Math.abs(m) !== 1) {
            slopeIntercept += m.toFixed(1);
        } else if (m === -1) {
            slopeIntercept += '-';
        }
        slopeIntercept += 'x';
        if (b > 0) {
            slopeIntercept += ` + ${b.toFixed(1)}`;
        } else if (b < 0) {
            slopeIntercept += ` - ${Math.abs(b).toFixed(1)}`;
        }
        document.getElementById('slopeInterceptResult').textContent = slopeIntercept;
        
        // 点斜式
        const psText = `y - ${refY.toFixed(1)} = ${m.toFixed(1)}(x - ${refX})`;
        document.getElementById('pointSlopeResult').textContent = psText;
        
        // 两点式 (参考点 + x截距点)
        const xi = -b/m;
        const twoPointsText = `(y-${refY.toFixed(1)})/${(b - refY).toFixed(1)} = (x-${refX})/${(xi - refX).toFixed(1)}`;
        document.getElementById('twoPointsResult').textContent = twoPointsText;
        
        // 截距式
        let interceptText = '';
        if (xi !== 0 && b !== 0) {
            interceptText = `x/${xi.toFixed(1)} + y/${b.toFixed(1)} = 1`;
        } else {
            interceptText = '不适用 (经过原点)';
        }
        document.getElementById('interceptResult').textContent = interceptText;
        
        // 点方向式
        const dirText = `(x-${refX})/1 = (y-${refY.toFixed(1)})/${m.toFixed(1)}`;
        document.getElementById('directionResult').textContent = dirText;
        
        // 点法向式
        const norText = `${m.toFixed(1)}(x-${refX}) - 1(y-${refY.toFixed(1)}) = 0`;
        document.getElementById('normalResult').textContent = norText;
        
        // 一般式
        let generalText = `${m.toFixed(1)}x - y`;
        if (b > 0) {
            generalText += ` + ${b.toFixed(1)} = 0`;
        } else if (b < 0) {
            generalText += ` - ${Math.abs(b).toFixed(1)} = 0`;
        } else {
            generalText += ' = 0';
        }
        document.getElementById('generalResult').textContent = generalText;
    }
}