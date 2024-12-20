var f_cmdParam = {
    'fc_Read': 0x04, //读只读寄存器——功能码
    'fc_Read2': 0x03, //读可写寄存器——功能码
    'fc_Set': 0x10, //设置寄存器——功能码
  
    'dl_int': 2, //整型数据长度
    'dl_float': 4, //浮点型数据长度

    'slaveAddr': {
      addr: 0x2001,
      registerCount: 1,
      dataLen: 2,
    },

    'MeasureMode': {
      addr: 0x2008,
      registerCount: 1,
      dataLen: 2,
    },

    'dampingTime': {
      addr: 0x200B,
      registerCount: 1,
      dataLen: 2,
    },

    'outputSmooth': {
      addr: 0x2091,
      registerCount: 2,
      dataLen: 4,
    },

    'outputAver': {
      addr: 0x2090,
      registerCount: 1,
      dataLen: 2,
    },

    'maxFlow': {
      addr: 0x2046,
      registerCount: 2,
      dataLen: 4,
    },

    'minFlow': {
      addr: 0x2044,
      registerCount: 2,
      dataLen: 4,
    },

    'trackAcceleratedSpeed': {
      addr: 0x2093,
      registerCount: 2,
      dataLen: 4,
    },

    'zeroingThreshold': {
      addr: 0x2095,
      registerCount: 2,
      dataLen: 4,
    },

    'zeroingTimer': {
      addr: 0x2011,
      registerCount: 1,
      dataLen: 2,
    },

    'queryMeasureResult': {
      addr: 0x0A0F,
      registerCount: 2,
      dataLen: 4,
    },

    'EchoCurve': {
      addr: 0x1000,
      list: [
        {
          id: 0,
          registerCount: 64,
        },
        {
          id: 1,
          registerCount: 64,
        },
        {
          id: 2,
          registerCount: 64,
        },
        {
          id: 3,
          registerCount: 64,
        },
        {
          id: 4,
          registerCount: 64,
        },
        {
          id: 5,
          registerCount: 64,
        },
        {
          id: 6,
          registerCount: 64,
        },
        {
          id: 7,
          registerCount: 64,
        },
        {
          id: 8,
          registerCount: 64,
        },
        {
          id: 9,
          registerCount: 64,
        },
        {
          id: 10,
          registerCount: 64,
        },
      ]
    },

    'ThreadholdCurve': {
      addr: 0x1800,
      list: [
        {
          id: 0,
          registerCount: 64,
        },
        {
          id: 1,
          registerCount: 64,
        },
        {
          id: 2,
          registerCount: 64,
        },
        {
          id: 3,
          registerCount: 64,
        },
        {
          id: 4,
          registerCount: 64,
        },
        {
          id: 5,
          registerCount: 64,
        },
        {
          id: 6,
          registerCount: 64,
        },
        {
          id: 7,
          registerCount: 64,
        },
        {
          id: 8,
          registerCount: 64,
        },
        {
          id: 9,
          registerCount: 64,
        },
        {
          id: 10,
          registerCount: 64,
        },
      ]
    },

    'ThreadholdBaseCurve': {
      addr: 0x0200,
      list: [
        {
          id: 0,
          registerCount: 64,
        },
        {
          id: 1,
          registerCount: 64,
        },
        {
          id: 2,
          registerCount: 64,
        },
        {
          id: 3,
          registerCount: 64,
        },
        {
          id: 4,
          registerCount: 64,
        },
        {
          id: 5,
          registerCount: 64,
        },
        {
          id: 6,
          registerCount: 64,
        },
        {
          id: 7,
          registerCount: 64,
        },
        {
          id: 8,
          registerCount: 64,
        },
        {
          id: 9,
          registerCount: 64,
        },
        {
          id: 10,
          registerCount: 64,
        },
      ]
    },

    'uploadWave': {
      addr: 0x2038,
      registerCount: 1,
      dataLen: 2,
      start: 2,
      end: 0, 
    },

    'bleName': {
      addr: 0x3003,
      registerCount: 6,
      dataLen: 12,
    }, 

    'blePincode': {
      addr: 0x3000,
      registerCount: 3,
      dataLen: 6,
    },

    'sensorSelfOffset': {
      addr: 0x0A19,
      registerCount: 2,
      dataLen: 4,
    },

    'D_R': {
      addr: 0x0A02,
      registerCount: 2,
      dataLen: 4,
    },

    'bleLogin': {
      'addr': 0x300D, //起始地址
      'registerCount': 3,
      'dataLen': 6,
    },
    
    'startState': {
      'addr': 0x0a00,
      'registerCount': 35,
      'dataLen': 70,
    },

    'thresholdMargin': {
      addr: 0x2020,
      registerCount: 1,
      dataLen: 2,
    },

    'angleValue': {
      addr: 0x0a22,
      registerCount: 1,
      dataLen: 2,
    },
};
  
module.exports = {
    f_cmdParam: f_cmdParam
}