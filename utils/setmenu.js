//settings: head:设置项名称，type:设置项类型（1输入类型（数字）；2选择类型；3输入类型（字符串）），option:选择内容项
var lang = require('./languageUtils');

var _lang = lang._lang();

var setMenu = [
  {
    'name': '基本设置',
    'settings': [{
      'head': '量程',
      'type': 1,
      'unit': 'm',
      'variable': 'farRange',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '盲区',
      'type': 1,
      'unit': 'm',
      'variable': 'nearRange',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '高位调整',
      'type': 1,
      'unit': 'm',
      'variable': 'highCalib',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '低位调整',
      'type': 1,
      'unit': 'm',
      'variable': 'lowCalib',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '进料速率',
      'type': 1,
      'unit': 'm/min',
      'variable': 'fillRate',
      'value': 0,
      'times': 100,
      'baseValue': 0,
      'max': 300,
      'min': 0
    }, {
      'head': '出料速率',
      'type': 1,
      'unit': 'm/min',
      'variable': 'emptyRate',
      'value': 0,
      'times': 100,
      'baseValue': 0,
      'max': 300,
      'min': 0
    }, {
      'head': '修正偏移',
      'type': 1,
      'unit': 'm',
      'variable': 'sensorOffsetmodify',
      'value': 0,
      'baseValue': 0,
    }],
  }, {
    'name': '传感器及介质设置',
    'settings': [
      {
        'head': '应用类型',
        'type': 2,
        'option': ['固体', '液体'],
        'variable': 'meterType',
        'value': 0,
        'baseValue': 0,
      }, {
        'head': '容器类型',
        'type': 2,
        'option': ['大容积仓', '中等容积仓', '细高仓', '演示模式', '搅拌/快速入料'],
        'variable': 'application',
        'value': 0,
        'baseValue': 0,
      }, {
        'head': '介质类型',
        'type': 2,
        'option': ['粉料/介电常数>10', '小颗粒/介电常数<10', '大块/介电常数<3'],
        'variable': 'mediumType',
        'value': 0,
        'baseValue': 0,
      }, {
        'head': '测量类型',
        'type': 2,
        'option': ['物位', '空高', '距离'],
        'variable': 'sensorMode',
        'value': 0,
        'baseValue': 0,
      }, {
        'head': '阻尼滤波',
        'type': 1,
        'unit': 's',
        'variable': 'dampingFilter',
        'value': 0,
        'baseValue': 0,
        'min': 0,
        'max': 600
      },],
  }, {
    'name': '阈值学习',
    'settings': [{
      'head': '学习模式',
      'type': 2,
      'option': ['全区域', '选择区域', '排除区域'],
      'variable': 'TVTStudyMode',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '起始位置',
      'type': 1,
      'unit': 'm',
      'variable': 'TVTStudyStart',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '结束位置',
      'type': 1,
      'unit': 'm',
      'variable': 'TVTStudyEnd',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '阈值学习',
      'type': 2,
      'option': ['学习完成', '阈值学习', '阈值清零', '出厂阈值学习'],
      'variable': 'TVTStudy',
      'value': 0,
      'baseValue': 0,
    },]
  }, {
    'name': '专家设置',
    'settings': [
    {
      'head': '回波算法',
      'type': 2,
      'option': ['首波', '最大首波', '最好首波', '末波'],
      'variable': 'echoAlgorithm',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '平均',
      'type': 1,
      'unit': '',
      'variable': 'outputAver',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '输出平滑',
      'type': 1,
      'unit': '',
      'variable': 'TxPower3',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': 'TVT余量',
      'type': 1,
      'unit': 'dB',
      'variable': 'echoThreshold',
      'value': 0,
      'baseValue': 0,
      'initValue': 0,
    }, {
      'head': '门限幅度',
      'type': 1,
      'unit': 'dB',
      'variable': 'thresholdRange',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '电流标定',
      'type': 1,
      'unit': 'mA',
      'variable': 'currentCalibration',   // reserved
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '接收增益',
      'type': 2,
      'option': ['偏低', '正常', '偏高'],
      'variable': 'RxGain',
      'value': 0,
      'baseValue': 0,
    }, { 
      'head': '发射功率',
      'type': 2,
      'option': ['偏低', '正常', '偏高'],
      'variable': 'TxPower1',
      'value': 0,
      'baseValue': 0,
    }, { 
      'head': '恢复出厂',
      'type': 2,
      'option': ['恢复出厂', '格式化'],
      'variable': 'resetDevice',  // reserved
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '环境适应',
      'type': 1,
      'unit': 'cm',
      'variable': 'envAdaptation',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '跟踪范围',
      'type': 1,
      'unit': '',
      'variable': 'trackingRange',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '抑制因子',
      'type': 1,
      'unit': '',
      'variable': 'trackSmooth1',  // reserved
      'value': 0,
      'baseValue': 0,
    },{
      'head': '首波增强',
      'type': 1,
      'unit': 'dB',
      'variable': 'firstWaveEnhance',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '跟踪阈值',
      'type': 1,
      'unit': 'dB',
      'variable': 'trackThreshold',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '曲线平滑',
      'type': 1,
      'unit': '',
      'variable': 'curveSmooth1',  // reserved
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '跟踪速度1',
      'type': 1,
      'uint': '',
      'variable': 'trackingRange1',  // reserved
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '跟踪速度2',
      'type': 1,
      'uint': '',
      'variable': 'trackingRange2',  // reserved
      'value': 0,
      'baseValue': 0,
    }]
  }, {
    'name': '模拟量标定',
    'settings': [{
      'head': '电流函数',
      'type': 2,
      'option': ['物位', '空高', '距离'],
      'variable': 'mAcurrentutputFunction',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '4mA设定',
      'type': 1,
      'unit': 'm',
      'variable': 'mA4Setpoint',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '20mA设定',
      'type': 1,
      'unit': 'm',
      'variable': 'mA20Setpoint',
      'value': 0,
      'baseValue': 0,
    }, {
      'head': '输出模式',
      'type': 2,
      'unit': 'mA',
      'variable': 'mACurrentOutputMode',
      'option': ['手动', '自动', '禁用'],
      'value': 0,
      'baseValue': 0,
    }, {
      'head': 'mA手动值',
      'type': 1,
      'unit': 'mA',
      'variable': 'mAManualvalue',
      'value': 0,
      'times': 1000,
      'baseValue': 0,
      'min': 4,
      'max': 20,
    }]
  }, {
    'name': '蓝牙设置',
    'settings': [{
      'head': '蓝牙名称',
      'type': 3,
      'variable': 'bleName',
      'value': '--',
      'baseValue': '--',
    }, {
      'head': '蓝牙密码',
      'type': 1,
      'variable': 'blePin',
      'value': '--',
      'baseValue': '--',
    },]
  },];

module.exports = {
  setMenu: setMenu
}