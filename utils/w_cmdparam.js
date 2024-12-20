var w_cmdParam = {
    'fc_Read': 0x04, //读只读寄存器——功能码
    'fc_Read2': 0x03, //读可写寄存器——功能码
    'fc_Set': 0x10, //设置寄存器——功能码
  
    'dl_int': 2, //整型数据长度
    'dl_float': 4, //浮点型数据长度

    'reFactorySet': {
      addr: 0x1000,
      registerCount: 1,
      dataLen: 2,
    },

    'slaveAddr': {
      addr: 0x2001,
      registerCount: 1,
      dataLen: 2,
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

    'dampingTime': {
      addr: 0x200B,
      registerCount: 1,
      dataLen: 2,
    },

    'thresholdMargin': {
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

    'queryMeasureResult': {
      addr: 0x0A0F,
      registerCount: 2,
      dataLen: 4,
    },

    'querySignalStrength': {
      addr: 0x0A1D,
      registerCount: 1,
    },

    'uploadWaveForm': {
      addr: 0x2034,
      registerCount: 1,
      dataLen: 2,
    },

    'queryEchoCurve': {
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
        {
          id: 11,
          registerCount: 64,
        },
        {
          id: 12,
          registerCount: 64,
        },
        {
          id: 13,
          registerCount: 64,
        },
        {
          id: 14,
          registerCount: 64,
        },
        {
          id: 15,
          registerCount: 64,
        }
      ]
    },

    'queryEchoCurve1': {
      addr: 0x1000,
      registerCount: 100,
    },

    'queryEchoCurve2': {
      addr: 0x1064,
      registerCount: 100,
    },

    'queryEchoCurve3': {
      addr: 0x10C8,
      registerCount: 100,
    },

    'queryEchoCurve4': {
      addr: 0x10C8,
      registerCount: 100,
    },

    'queryThreadholdCurve': {
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
        {
          id: 11,
          registerCount: 64,
        },
        {
          id: 12,
          registerCount: 64,
        },
        {
          id: 13,
          registerCount: 64,
        },
        {
          id: 14,
          registerCount: 64,
        },
        {
          id: 15,
          registerCount: 64,
        }
      ]
    },

    'queryThreadholdCurve2': {
      addr: 0x187C,
      registerCount: 100,
    },

    'queryThreadholdCurve3': {
      addr: 0x18F8,
      registerCount: 100,
    },

    'uploadWave': {
      addr: 0x2038,
      registerCount: 1,
      dataLen: 2,
      start: 1,
      end: 0, 
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

    'softVersion': {
      addr: 0x1015,
      registerCount: 8,
      dataLen: 16,
    },

    'D_R': {
      addr: 0x0A02,
      registerCount: 2,
      dataLen: 4,
    },

    'ADCSampleRate': {
      addr: 0x0A1F,
      registerCount: 2,
      dataLen: 4,
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

    'bleName': {
      addr: 0x3003,
      registerCount: 6,
      dataLen: 12,
    }, 

    'blePincode': {
      addr: 0x3000,
      registerCount: 3,
      dataLen: 6,
    }
};
  
module.exports = {
    w_cmdParam: w_cmdParam
}