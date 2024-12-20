var cmdParam = {
  'fc_Read': 0x04, //读只读寄存器——功能码
  'fc_Read2': 0x03, //读可写寄存器——功能码
  'fc_Set': 0x10, //设置寄存器——功能码
  'fc_Read3': 0x46, //发射芯片寄存器功能码
  'fc_Set2': 0x48, //发射芯片寄存器功能码

  'dl_int': 2, //整型数据长度
  'dl_float': 4, //浮点型数据长度

  'paramGroup1': {
    'addr': 0x0A00, //起始地址
    'registerCount': 0x1B, //寄存器数量
    'temperature': {
      offset: 0x02, //
      datalen: 2, //
    },
    'distance_Rate': {
      offset: 0x04, //
      datalen: 4, //
    },
    'errorCode': {
      offset: 0x10, //
      datalen: 2, //
    },
    'mARealtimeValue': {
      offset: 0x1C, //
      datalen: 2, //
    },
    'dampingResult': {
      offset: 0x1E, //
      datalen: 4, //
    },
    'realtimeResult': {
      offset: 0x22, //
      datalen: 4, //
    },
    'dampingVal': {
      offset: 0x2A, //
      datalen: 4, //
    },
    'realtimeVal': {
      offset: 0x2E, //
      datalen: 4, //
    },
    'sensorOffset': {
      offset: 0x32, //
      datalen: 4, //
    },
  },
  'paramGroup2': {
    'addr': 0x1000, //起始地址
    'registerCount': 0x44, //寄存器数量
    'resetDevice': {
      offset: 0x00,
      datalen: 2,
    },
    'sensorType': {
      offset: 0x02,
      datalen: 16,
    },
    'deviceSN': {
      offset: 0x12,
      datalen: 16,
    },
    'productionDate': {
      offset: 0x22,
      datalen: 8,
    },
    'softwareVersion': {
      offset: 0x2A,
      datalen: 16,
    },
    'sensorShortTag': {
      offset: 0x5A,
      datalen: 6,
    },
    'sensorLongTag': {
      offset: 0x60,
      datalen: 32,
    },
  },
  'paramGroup4': {
    'addr': 0x2000, //起始地址
    'registerCount': 0x77, //寄存器数量
    'deviceAddress': {
      offset: 0x02,
      datalen: 2,
    },
    'application': {
      offset: 0x10,
      datalen: 2,
    },
    'distanceUnit': {
      offset: 0x12,
      datalen: 2,
    },
    'sensorMode': {
      offset: 0x14,
      datalen: 2,
    },
    'dampingFilter': {
      offset: 0X16,
      datalen: 2,
    },
    'errorTimer': {
      offset: 0x22,
      datalen: 2,
    },
    'mAlostOfEcho': {
      offset: 0x28,
      datalen: 2,
    },
    'mAcurrentutputFunction': {
      offset: 0x2A,
      datalen: 2,
    },
    'mAMinimum': {
      offset: 0x30,
      datalen: 2,
    },
    'mAMaximum': {
      offset: 0x32,
      datalen: 2,
    },
    'mACurrentOutputMode': {
      offset: 0x34,
      datalen: 2,
    },
    'mAManualvalue': {
      offset: 0x36,
      datalen: 2,
    },
    'mATheoreticalValue': {
      offset: 0x38,
      datalen: 2,
    },
    'TxPower3': {
      offset: 0x4A,
      datalen: 2,
    },
    'mediumType': {
      offset: 0x60,
      datalen: 2,
    },
    'vesselBottom': {
      offset: 0x62,
      datalen: 2,
    },
    'samplingCountType': {
      offset: 0x66,
      datalen: 2,
    },
    'TVTStudyMode': {
      offset: 0x7C,
      datalen: 2,
    },
    'TVTStudyStart': {
      offset: 0x7E,
      datalen: 4,
    },
    'TVTStudyEnd': {
      offset: 0x82,
      datalen: 4,
    },
    'TVTStudy': {
      offset: 0x86,
      datalen: 2,
    },
    'nearRange': {
      offset: 0x88,
      datalen: 4,
    },
    'farRange': {
      offset: 0x8C,
      datalen: 4,
    },
    'lowCalib': {
      offset: 0x90,
      datalen: 4,
    },
    'highCalib': {
      offset: 0x94,
      datalen: 4,
    },
    'sensorOffset': {
      offset: 0x98,
      datalen: 4,
    },
    'sensorOffsetmodify': {
      offset: 0x9C,
      datalen: 4,
    },
    'mA4Setpoint': {
      offset: 0xA0,
      datalen: 4,
    },
    'mA20Setpoint': {
      offset: 0xA4,
      datalen: 4,
    },
    'fillRate': {
      offset: 0xAC,
      datalen: 2,
    },
    'emptyRate': {
      offset: 0xAE,
      datalen: 2,
    },
    // 应用类型 0：固体 1：液体
    'meterType': {
      offset: 0xD2,
      datalen: 2,
    },
    'echoAlgorithm': {
      offset: 0x3E,
      datalen: 2,
    },
    'outputAver': {
      offset: 0x6E,
      datalen: 2,
    },
    'outputSmooth': {
      offset: 0xEA,
      datalen: 4,
    },
    'echoThreshold': {
      offset: 0x40,
      datalen: 2,
    },
    'trackThreshold': {
      offset: 0x54  ,
      datalen: 2,
    },
    'thresholdRange': {
      offset: 0xDA  ,
      datalen: 2,
    },
    'envAdaptation': {
      offset: 0x64,
      datalen: 2,
    },
    'trackingRange': {
      offset: 0xE4,
      datalen: 2,
    },
    'trackingRange1': {
      offset: 0xE4,
      datalen: 2,
    },
    'trackingRange2': {
      offset: 0xE4,
      datalen: 2,
    },
    'trackSmooth1': {
      offset: 0xE8,
      datalen: 2,
    },
    'trackSmooth2': {
      offset: 0x4A,
      datalen: 2,
    },
    'trackSmooth3': {
      offset: 0xE4,
      datalen: 2,
    },
    'firstWaveEnhance': {
      offset: 0x54,
      datalen: 2,
    },
    'curveSmooth1': {
      offset: 0xD8,
      datalen: 2,
    },
    'curveSmooth2': {
      offset: 0x52,
      datalen: 2,
    },
  },
  'paramGroup5': {
    'addr': 0x3000, //起始地址
    'registerCount': 13, //寄存器数量
    'blePin': {
      offset: 0x00,
      datalen: 6,
    },
    'bleName': {
      offset: 0x06,
      datalen: 20,
    }
  },
  'paramGroup6': {
    'addr': 0x1100, //起始地址
    'registerCount': 0x30, //寄存器数量
    'currentCalibration': {
      offset: 0x5A,
      datalen: 4,
    },
  },
  'paramGroup7': {
    'addr': 0x0000, //起始地址
    'registerCount': 0x30, //寄存器数量
    'TxPower1': {
      offset: 0x46,
      datalen: 2,
    },
    'RxGain': {
      offset: 0x4c,
      datalen: 2,
    },
  },
  
  'softwareVersion': {
    'addr': 0x1015, //起始地址
    'registerCount': 8, //寄存器数量
    'dataLen': 16, //数据字节数
    'data': '',
  },
  //LCD波形读取请求
  'readLCD': {
    'addr': 0x2034, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'start': 1, //开始请求
    'end': 0, //结束请求
  },
  //lcd 波形数据（FFT&TVT)
  'lcdCurvedata': {
    'addr': 0x8000, //起始地址
    'addr_End': 0x807B, //寄存器空间 截止地址
    'registerCount': 0x7C //寄存器数量
  },
  //lcd FFT波形数据
  'lcdFFTdata': {
    'addr': 0x8000, //起始地址
    'addr_End': 0x803F, //寄存器空间 截止地址
    'registerCount': 0x40 //寄存器数量
  },
  //lcd TVT波形数据
  'lcdTVTdata': {
    'addr': 0x8040, //起始地址
    'addr_End': 0x807F, //寄存器空间 截止地址
    'registerCount': 0x40 //寄存器数量
  },
  //FFT波形读取请求
  'readFFT': {
    'addr': 0x2038, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'start': 1, //开始请求FFT
    'end': 0, //结束请求FFT
  },
  //FFT波形数据
  'FFTdata': {
    'addr': 0x1000, //起始地址
    'addr_End': 0x17FF, //寄存器空间 截止地址
    'registerCount': 120 //寄存器数量
  },
  //TVT调整波形数据
  'TVTModifydata': {
    'addr': 0x1800, //起始地址
    'addr_End': 0x1FFF, //寄存器空间 截止地址
    'registerCount': 120 //寄存器数量
  },
  //TVT基准波形数据
  'TVTdata': {
    'addr': 0x0200, //起始地址
    'addr_End': 0x09FF, //寄存器空间 截止地址
    'registerCount': 120 //寄存器数量
  },
  //'量程：'
  'farRange': {
    'addr': 0x2046, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  // '盲区：'
  'nearRange': {
    'addr': 0x2044, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  //'高位调整：'
  'highCalib': {
    'addr': 0x204A, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  //'低位调整：',
  'lowCalib': {
    'addr': 0x2048, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  //'进料速度：',
  'fillRate': {
    'addr': 0x2056, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  // '出料速度：',
  'emptyRate': {
    'addr': 0x2057, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  //'修正偏移：',
  'sensorOffsetmodify': {
    'addr': 0x204E, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  // '容器类型 ['大容积仓','中等容积仓','演示模式','搅拌/快速入料'],
  'application': {
    'addr': 0x2008, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  // '应用类型 ['固体', '液体'],
  'meterType': {
    'addr': 0x2069, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  //'介质类型 ['粉料/介电常数>10', '小颗粒/介电常数<10', '大块/介电常数<3'],
  'mediumType': {
    'addr': 0x2030, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  //传感器模式 测量类型 ['物位', '空高', '距离'],
  'sensorMode': {
    'addr': 0x200A, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  // '阻尼滤波
  'dampingFilter': {
    'addr': 0x200B, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  //电流函数 ['物位', '空高', '距离', '手动']
  'mAcurrentutputFunction': {
    'addr': 0x2015, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'echoAlgorithm': {
    'addr': 0x201F, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'outputAver': {
    'addr': 0x2037, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'outputSmooth': {
    'addr': 0x2075, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  'thresholdRange': {
    'addr': 0x206D, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'currentCalibration': {
    'addr': 0x112D, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  'RxGain': {
    'addr': 0x0026, //起始地址
    //'addr': 0x203A, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'TxPower': {
    'addr': 0x2067, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'TxPower1': {
    'addr': 0x0023, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'TxPower2': {
    'addr': 0x0024, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'TxPower3': {
    'addr': 0x2025, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'envAdaptation': {
    'addr': 0x2032, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'initData': 0,
  },
  'trackingRange': {
    'addr': 0x2072, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'initData': 0,
  },
  'trackingRange1': {
    'addr': 0x2072, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'initData': 0,
  },
  'trackingRange2': {
    'addr': 0x2072, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'initData': 0,
  },
  'trackSmooth1': {
    'addr': 0x2074, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'trackSmooth2': {
    'addr': 0x2025, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  'trackSmooth3': {
    'addr': 0x2072, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'initData': 0,
  },
  'trackThreshold': {
    'addr': 0x202A, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'initData': 0,
  },
  'firstWaveEnhance': {
    'addr': 0x202A, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'initData': 0,
  },
  'curveSmooth1': {
    'addr': 0x206C, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'initData': 0,
  },
  'curveSmooth2': {
    'addr': 0x2029, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'initData': 0,
  },
  //'4mA设定:'
  'mA4Setpoint': {
    'addr': 0x2050, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  //20mA设定:'
  'mA20Setpoint': {
    'addr': 0x2052, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  //mA 输出模式
  'mACurrentOutputMode': {
    'addr': 0x201A, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  //'mA手动值:
  'mAManualvalue': {
    'addr': 0x201B, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  // '故障定时 丢波时间',
  'errorTimer': {
    'addr': 0x2011, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  // '故障电流  ['3.8mA', '4mA', '20mA', '21mA', '固定'],
  'mAlostOfEcho': {
    'addr': 0x2014, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  // '阈值区域学习模式  [0-全区域,1-选择区域,2-排除区域 ],
  'TVTStudyMode': {
    'addr': 0x203E, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  // '阈值学习起始位置  
  'TVTStudyStart': {
    'addr': 0x203F, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  // '阈值学习结束位置  
  'TVTStudyEnd': {
    'addr': 0x2041, //起始地址
    'registerCount': 2, //寄存器数量
    'dataLen': 4, //数据字节数
  },
  // 阈值学习指令  [0-完成，1-学习,2-阈值清零，3-出厂阈值学习 ],
  'TVTStudy': {
    'addr': 0x2043, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  // 阈值余量
  'echoThreshold': {
    'addr': 0x2020, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
    'initData': 0,
  },
  // 徘徊因子
  'hoverLevel': {
    'addr': 0x202F, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  // 复位
  'resetDevice': {
    'addr': 0x1000, //起始地址
    'registerCount': 1, //寄存器数量
    'dataLen': 2, //数据字节数
  },
  // ble pin 非雷达指令
  'blePin': {
    'addr': 0x3000, //起始地址
    'registerCount': 3,
    'dataLen': 6,
  },
  // ble Name 非雷达指令
  'bleName': {
    'addr': 0x3003, //起始地址
    'registerCount': 10,
    'dataLen': 20,
  },
  // ble Name 非雷达指令
  'bleLogin': {
    'addr': 0x300D, //起始地址
    'registerCount': 3,
    'dataLen': 6,
  }
};

module.exports = {
  cmdParam: cmdParam
}