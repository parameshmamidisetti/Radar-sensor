var f_cmdParam = {
    'fc_Read': 0x04, //读只读寄存器——功能码
    'fc_Read2': 0x03, //读可写寄存器——功能码
    'fc_Set': 0x10, //设置寄存器——功能码
  
    'dl_int': 2, //整型数据长度
    'dl_float': 4, //浮点型数据长度

    'slaveAddr': {
      addr: 0xC001,
      registerCount: 1,
      dataLen: 2,
    },

    'MeasureMode': {
      addr: 0xC008,
      registerCount: 1,
      dataLen: 2,
    },

    'dampingTime': {
      addr: 0xC00B,
      registerCount: 1,
      dataLen: 2,
    },

    'outputSmooth': {
      addr: 0xC091,
      registerCount: 2,
      dataLen: 4,
    },

    'outputAver': {
      addr: 0xC090,
      registerCount: 1,
      dataLen: 2,
    },

    'maxFlow': {
      addr: 0xC046,
      registerCount: 2,
      dataLen: 4,
    },

    'minFlow': {
      addr: 0xC044,
      registerCount: 2,
      dataLen: 4,
    },

    'trackAcceleratedSpeed': {
      addr: 0xC093,
      registerCount: 2,
      dataLen: 4,
    },

    'zeroingThreshold': {
      addr: 0xC095,
      registerCount: 2,
      dataLen: 4,
    },

    'zeroingTimer': {
      addr: 0xC011,
      registerCount: 1,
      dataLen: 2,
    },

    'queryMeasureResult': {
      addr: 0xAA15,
      registerCount: 2,
      dataLen: 4,
    },

    'EchoCurve': {
      addr: 0xB000,
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
      addr: 0xB800,
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
      addr: 0xA200,
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
      addr: 0xC038,
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
      addr: 0xAA19,
      registerCount: 2,
      dataLen: 4,
    },

    'D_R': {
      addr: 0xAA02,
      registerCount: 2,
      dataLen: 4,
    },

    'bleLogin': {
      'addr': 0x300D, //起始地址
      'registerCount': 3,
      'dataLen': 6,
    },
    
    'startState': {
      'addr': 0xAA00,
      'registerCount': 35,
      'dataLen': 70,
    },

    'thresholdMargin': {
      addr: 0xC020,
      registerCount: 1,
      dataLen: 2,
    },

    'angleValue': {
      addr: 0xAA22,
      registerCount: 1,
      dataLen: 2,
    },

    'totalVolume': {
      addr: 0xAA25,
      registerCount: 2,
      dataLen: 4,
    },

    'waterLevel': {
      addr: 0xAA23,
      registerCount: 2,
      dataLen: 4,
    },

    'meanFlow': {
      addr: 0xAA0F,
      registerCount: 2,
      dataLen: 4,
    },

    'realTimeFlow': {
      addr: 0xAA11,
      registerCount: 2,
      dataLen: 4,
    },

    'appType': {
      addr: 0x2008,
      registerCount: 1,
      dataLen: 2,
    },
    
    'meaType': {
      addr: 0x200A,
      registerCount: 1,
      dataLen: 2,
    },
  
    'dampingTimeWater': {
      addr: 0x200B,
      registerCount: 1,
      dataLen: 2,
    },
  
    'thresholdMarginWater': {
      addr: 0x2020,
      registerCount: 1,
      dataLen: 2,
    },
  
    'uploadMode': {
      addr: 0x2034,
      registerCount: 1,
      dataLen: 2,
    },
  
    'blindAreaRange': {
      addr: 0x2044,
      registerCount: 2,
      dataLen: 4,
    },
  
    'rangeRange': {
      addr: 0x2046,
      registerCount: 2,
      dataLen: 4,
    },
  
    'lowAdjustment': {
      addr: 0x2048,
      registerCount: 2,
      dataLen: 4,
    },
  
    'highAdjustment': {
      addr: 0x204A,
      registerCount: 2,
      dataLen: 4,
    },
  
    'sensorCorOffset': {
      addr: 0x204E,
      registerCount: 2,
      dataLen: 4,
    },
  
    'feedRate': {
      addr: 0x2056,
      registerCount: 1,
      dataLen: 2,
    },
  
    'dischargeRate': {
      addr: 0x2057,
      registerCount: 1,
      dataLen: 2,
    },
    
    'fakeEchoLearn': {
      addr: 0x203E,
      registerCount: 6,
      dataLen: 12,
    },
  
    'fakeEchoLearnState': {
      addr: 0x2043,
      registerCount: 1,
    },
  
    'enterSleepMode': {
      addr: 0x2061,
      registerCount: 1,
      dataLen: 2,
    },
  
    'activeUploadMeasureFramCount': {
      addr: 0x5207,
      registerCount: 1,
      dataLen: 2,
    },
  
    'averageTimes': {
      addr: 0x2037,
      registerCount: 1,
      dataLen: 2,
    },
  
    'measureInterval': {
      addr: 0x202E,
      registerCount: 1,
      dataLen: 2,
    },
  
    'queryFaultCode': {
      addr: 0x0A08,
      registerCount: 1,
    },
  
    'querySignalStrength': {
      addr: 0x0A1D,
      registerCount: 1,
    },

    'loseWaveDistance': {
      addr: 0x2014,
      registerCount: 1,
      dataLen: 2,
    },
  
    'continueLoseTime': {
      addr: 0x2011,
      registerCount: 1,
      dataLen: 2,
    },

    'sensorSelfOffset': {
      addr: 0x0A19,
      registerCount: 2,
      dataLen: 4,
    },
  
    'deviceSN': {
      addr: 0x1009,
      registerCount: 8,
      dataLen: 16,
    },

    'sensorType': {
      'addr': 0x1001, //起始地址
      'registerCount': 8,
      'dataLen': 16,
    },

    'installationOffset': {
      'addr': 0xC09E, //起始地址
      'registerCount': 2,
      'dataLen': 4,
    },

    'riveAngleLeft': {
      'addr': 0xC0A0, //起始地址
      'registerCount': 2,
      'dataLen': 4,
    },

    'riveAngleRight': {
      'addr': 0xC0AD, //起始地址
      'registerCount': 2,
      'dataLen': 4,
    },

    'riverBottomWidth': {
      'addr': 0xC0A2, //起始地址
      'registerCount': 2,
      'dataLen': 4,
    },

    'velOffset': {
      'addr': 0xC0B1, //起始地址
      'registerCount': 2,
      'dataLen': 4,
    },

    'riverDischarge': {
      'addr': 0xC0AB, //起始地址
      'registerCount': 2,
      'dataLen': 4,
    },

    'riverDischargeTotal': {
      'addr': 0xC0B3, //起始地址
      'registerCount': 2,
      'dataLen': 4,
    },

    'outSmoothWater': {
      'addr': 0x2075, //起始地址
      'registerCount': 2,
      'dataLen': 4,
    }
    
};
  
module.exports = {
    f_cmdParam: f_cmdParam
}