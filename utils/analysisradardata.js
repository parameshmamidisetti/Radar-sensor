import {
  cmdParam
} from './cmdparam';
import w_cmdparam, {
  w_cmdParam
} from './w_cmdparam'

/**
 * bufferdata 转换为int 解析整形数据int16
 */
function buf2int(dv) {
  return dv.getUint16();
}

/**
 * bufferdata 转换为float 解析浮点型数据
 */
function buf2float(dv) {
  let f_buffer = new ArrayBuffer(4);
  let f_dataView = new DataView(f_buffer);
  f_dataView.setUint16(0, dv.getUint16(2));
  f_dataView.setUint16(2, dv.getUint16(0));
  return f_dataView.getFloat32();
}

/**
 * bufferdata 转换为string 解析字符型数据 高低位转换
 */
function buf2str(dv) {
  let str = '';
  for (let s = 0; s < dv.byteLength; s += 2) {
    let c1 = dv.getUint8(s)
    if (c1 < 32 || c1 > 126) {
      c1 = 32; //不可见字符转为空格
    }
    let c2 = dv.getUint8(s + 1)
    if (c2 < 32 || c2 > 126) {
      c2 = 32; //不可见字符转为空格
    }
    str += String.fromCharCode(c2);
    str += String.fromCharCode(c1);
  }
  return str;
}

/**
 * bufferdata 转换为string 解析字符型数据
 */
function buf2str2(dv) {
  let str = '';
  for (let s = 0; s < dv.byteLength; s++) {
    let c = dv.getUint8(s)
    if (c < 32 || c > 126) {
      c = 32; //不可见字符转为空格
    }
    str += String.fromCharCode(c);
  }
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

/**
 * bufferdata 转换为以16进制显示的字符串 解析字符型数据
 */
function buf2hexstr(dv, strlen = 0) {
  let str = '';
  for (let s = 0; s < dv.byteLength; s += 2) {
    let c1 = dv.getUint8(s).toString(16);
    let c2 = dv.getUint8(s + 1).toString(16);
    if (c1.length == 1) {
      c1 = '0' + c1;
    }
    if (c2.length == 1) {
      c2 = '0' + c2;
    }
    str += c2.toString(16);
    str += c1.toString(16);
  }

  if (strlen) {
    str = str.slice(0, strlen);
  }

  return str;
}
/**
 * bufferdata 转换为波形数据 解析波形数据
 */
function buf2wavedata(dv) {
  let waveData = [];
  for (let i = 0; i < dv.byteLength; i += 2) {
    waveData.push(dv.getUint8(i + 1));
    waveData.push(dv.getUint8(i));
  }
  return waveData;
}

/**
 * 解析雷达发来的数据包
 */
function analysis_radardata(buffer, register_addr) {
  let radarParam = {};
  let d_dataView = null;
  let wavedata = [];
  let offset = 0;
  let waveOffset = 0;
  let comdata = new Object();
  comdata.radar_addr = null;
  let dataView = new DataView(buffer);
  //检查数据是否满足最低长度
  if (dataView.byteLength < 8) {
    return false;
  }
  //雷达地址
  comdata.radar_addr = dataView.getUint8(0);
  //功能码  
  comdata.funcode = dataView.getUint8(1);
  //得到数据长度
  comdata.datalen = dataView.getUint8(2);
  switch (comdata.funcode) {
    case 0xE6: //连接测试命令回复
      radarParam.dataType = 'connTest';
      break;
    case 0x10: //设置命令的回复数据
      radarParam.dataType = 'settingBack';
      radarParam.rec_register_addr = dataView.getUint16(2);
      radarParam.rec_register_len = dataView.getUint16(4);
      break;
    case 0x03:
    case 0x04:
      //判断数据有效性
      if (comdata.datalen + 3 > buffer.byteLength) {
        return false;
      }
      switch (true) {
        case (register_addr == cmdParam.paramGroup1.addr && comdata.datalen == cmdParam.paramGroup1.registerCount * 2):
          //解析第一数据集成包
          radarParam = analysis_radardata_Group1(buffer);
          radarParam.dataType = 'radarInfo';
          break;
        case (register_addr == cmdParam.paramGroup2.addr && comdata.datalen == cmdParam.paramGroup2.registerCount * 2):
          //解析第二数据集成包
          radarParam = analysis_radardata_Group2(buffer);
          radarParam.dataType = 'radarParam';
          break;
        case (register_addr == cmdParam.paramGroup4.addr && comdata.datalen == cmdParam.paramGroup4.registerCount * 2):
          //解析第四数据集成包
          radarParam = analysis_radardata_Group4(buffer);
          radarParam.dataType = 'radarParam';
          break;
        case (register_addr == cmdParam.paramGroup5.addr && comdata.datalen == cmdParam.paramGroup5.registerCount * 2):
          // 解析第五数据包 蓝牙名称 密码
          radarParam = analysis_radardata_Group5(buffer);
          radarParam.dataType = 'radarParam';
          break;
        case (register_addr == cmdParam.paramGroup6.addr && comdata.datalen == cmdParam.paramGroup6.registerCount * 2):
          radarParam = analysis_radardata_Group6(buffer);
          radarParam.dataType = 'radarParam';
          break;
        case (register_addr == cmdParam.lcdCurvedata.addr && comdata.datalen == (cmdParam.lcdCurvedata.addr_End - cmdParam.lcdCurvedata.addr + 1) * 2):
          //解析lcd FFT&TVT曲线数据
          d_dataView = new DataView(buffer, 3, comdata.datalen);
          for (let i = 0; i < comdata.datalen; i += 2) {
            wavedata.push(d_dataView.getUint8(i + 1));
            wavedata.push(d_dataView.getUint8(i));
          }
          // FFT曲线
          let fft = wavedata.slice(0, 128)
          radarParam.lcd_echoCurve = fft.slice(0);
          // tvt曲线
          let tvt = wavedata.slice(128, )
          radarParam.lcd_TVTModifyCurve = tvt.slice(0);
          radarParam.dataType = 'LCDWave';
          break;
        case (register_addr == cmdParam.lcdFFTdata.addr && comdata.datalen == (cmdParam.lcdFFTdata.addr_End - cmdParam.lcdFFTdata.addr + 1) * 2):
          //解析lcd FFT曲线数据
          d_dataView = new DataView(buffer, 3, comdata.datalen);
          for (let i = 0; i < comdata.datalen; i += 2) {
            wavedata.push(d_dataView.getUint8(i + 1));
            wavedata.push(d_dataView.getUint8(i));
          }
          radarParam.lcd_echoCurve = wavedata.slice(0);
          radarParam.dataType = 'LCDWave';
          break;
        case (register_addr == cmdParam.lcdTVTdata.addr && comdata.datalen == (cmdParam.lcdTVTdata.addr_End - cmdParam.lcdTVTdata.addr + 1) * 2):
          //解析lcd TVT修正曲线数据
          d_dataView = new DataView(buffer, 3, comdata.datalen);
          for (let i = 0; i < comdata.datalen; i += 2) {
            wavedata.push(d_dataView.getUint8(i + 1));
            wavedata.push(d_dataView.getUint8(i));
          }
          radarParam.lcd_TVTModifyCurve = wavedata.slice(0);
          radarParam.dataType = 'LCDWave';
          break;
        case (register_addr >= cmdParam.FFTdata.addr && register_addr <= cmdParam.FFTdata.addr_End && comdata.funcode == cmdParam.fc_Read):
          //解析pc FFT曲线数据
          //得到曲线数据偏移量，首点的曲线序列号
          waveOffset = register_addr - cmdParam.FFTdata.addr;
          for (let i = 0; i < parseInt(comdata.datalen / 2); i++) {
            wavedata.push(buffer.readUInt16BE(3 + i * 2) / 500);
          }
          radarParam.echoCurve = new Array(512).fill(null);
          radarParam.echoCurve.splice(waveOffset, wavedata.length, ...wavedata);
          radarParam.dataType = 'PCWave';
          break;
        case (register_addr >= cmdParam.TVTModifydata.addr && register_addr <= cmdParam.TVTModifydata.addr_End && comdata.funcode == cmdParam.fc_Read):
          //解析pc TVT修正曲线数据
          //得到曲线数据偏移量，首点的曲线序列号
          waveOffset = register_addr - cmdParam.TVTModifydata.addr;
          for (let i = 0; i < parseInt(comdata.datalen / 2); i++) {
            wavedata.push(buffer.readUInt16BE(3 + i * 2) / 500);
          }
          radarParam.TVTModifyCurve = new Array(512).fill(null);
          radarParam.TVTModifyCurve.splice(waveOffset, wavedata.length, ...wavedata);
          radarParam.dataType = 'PCWave';
          break;
        case (register_addr >= cmdParam.TVTdata.addr && register_addr <= cmdParam.TVTdata.addr_End && comdata.funcode == cmdParam.fc_Read2):
          //解析pc TVT基准曲线数据
          //得到曲线数据偏移量，首点的曲线序列号
          waveOffset = register_addr - cmdParam.TVTdata.addr;
          for (let i = 0; i < parseInt(comdata.datalen / 2); i++) {
            wavedata.push(buffer.readUInt16BE(3 + i * 2) / 500);
          }
          radarParam.TVTBaseCurve = new Array(512).fill(null);
          radarParam.TVTBaseCurve.splice(waveOffset, wavedata.length, ...wavedata);
          radarParam.dataType = 'PCWave';

          break;
        default:
          radarParam = false;
      }
      break;
    case 0x46:
      switch (true)
      {
        case (register_addr == cmdParam.paramGroup7.addr && comdata.datalen == cmdParam.paramGroup7.registerCount * 2):
          radarParam = analysis_radardata_Group7(buffer);
          radarParam.dataType = 'radarParam';
          break;
        default:
          radarParam = false;
          break;
      }
      break;
    case 0x48:
      radarParam.dataType = 'settingBack';
      radarParam.rec_register_addr = dataView.getUint16(2);
      radarParam.rec_register_len = dataView.getUint16(4);
      break;
    default:
      radarParam = false;
  }

  return radarParam;
}


function w_analysis_radardata(buffer, register_addr) {
  let radarParam = {};
  let d_dataView = null;
  let wavedata = [];
  let offset = 0;
  let waveOffset = 0;
  let comdata = new Object();
  comdata.radar_addr = null;
  let dataView = new DataView(buffer);
  //检查数据是否满足最低长度
  if (dataView.byteLength < 8) {
    return false;
  }
  //雷达地址
  comdata.radar_addr = dataView.getUint8(0);
  //功能码  
  comdata.funcode = dataView.getUint8(1);
  //得到数据长度
  comdata.datalen = dataView.getUint8(2);
  switch (comdata.funcode) {
    case 0xE6: //连接测试命令回复
      radarParam.dataType = 'connTest';
      break;
    case 0x10: //设置命令的回复数据
      radarParam.dataType = 'settingBack';
      radarParam.rec_register_addr = dataView.getUint16(2);
      radarParam.rec_register_len = dataView.getUint16(4);
      break;
    case 0x03:
    case 0x04:
      //判断数据有效性
      if (comdata.datalen + 3 > buffer.byteLength) {
        return false;
      }
      
      switch (true) {
        case (register_addr == w_cmdParam.rangeRange.addr):
          d_dataView = new DataView(buffer, 3, comdata.datalen);
          v = buf2float(d_dataView);
          radarParam.farRange = v;
          radarParam.dataType = 'radarParam';
          break;

        case (register_addr == w_cmdParam.uploadWave.addr):
          radarParam.dataType = 'radarParam';
          break;

        case (register_addr == w_cmdParam.queryMeasureResult.addr):
          radarParam = get_water_level(buffer);
          radarParam.dataType = 'radarInfo';
          break;

        case (register_addr == w_cmdParam.queryEchoCurve.addr || register_addr == w_cmdParam.queryEchoCurve2.addr || register_addr == w_cmdParam.queryEchoCurve3.addr):
          d_dataView = new DataView(buffer, 3, comdata.datalen);
          for (let i = 0; i < comdata.datalen; i += 2) {
              wavedata.push(d_dataView.getUint16(i)/500);
          }
          
          radarParam.lcd_echoCurve = wavedata.slice(0, wavedata.length);
          radarParam.dataType = 'LCDWave';
          break;

        case (register_addr == w_cmdParam.queryThreadholdCurve.addr || register_addr == w_cmdParam.queryThreadholdCurve2.addr || register_addr == w_cmdParam.queryThreadholdCurve3.addr):
          d_dataView = new DataView(buffer, 3, comdata.datalen);
          for (let i = 0; i < comdata.datalen; i += 2) {
              wavedata.push(d_dataView.getUint16(i)/500);
          }

          radarParam.lcd_TVTModifyCurve = wavedata.slice(0, wavedata.length);
          radarParam.dataType = 'LCDWave';
          break;
      }
      break;
    default:
      radarParam = false;
  }

  return radarParam;
}

function get_water_level(buffer) {
  let radarParam = {};
  let d_dataView = new DataView(buffer, 3, 4);
  let v = null;

  v = buf2float(d_dataView);
  v = parseFloat(v.toFixed(4));

  radarParam['waterLevel'] = v;
  return radarParam;
}

function get_echo_profile(buffer) {
  d_dataView = new DataView(buffer, 3, comdata.datalen);
  for (let i = 0; i < comdata.datalen; i += 2) {
    wavedata.push(d_dataView.getUint8(i + 1));
    wavedata.push(d_dataView.getUint8(i));
  }
}

function get_threadhold_profile(buffer) {
  d_dataView = new DataView(buffer, 3, comdata.datalen);
  for (let i = 0; i < comdata.datalen; i += 2) {
    wavedata.push(d_dataView.getUint8(i + 1));
    wavedata.push(d_dataView.getUint8(i));
  }
}

/**
 * 处理分析 第一数据包数据
 *  'paramGroup1': {
 *  'addr': 0x0A00,//起始地址
 *  'registerCount': 0x1B, //寄存器数量
 *  'offset_temperature': 0x02, //温度
 *  'offset_Distance_Rate': 0x04, //D_R值 频率距离转换系数
 *  'offset_ErrorCode': 0x10, //故障码
 *  'offset_mARealtimeValue': 0x1C, //电流值实时
    'offset_DampingResult': 0x1E, //有效测量结果
    'offset_RealtimeResult': 0x22, //当前测量结果
    'offset_DampingVal': 0x2A, //有效距离
    'offset_RealtimeVal': 0x2E, //当前距离
 *  'offset_SensorOffset': 0x32, //传感器自身偏移
 */
function analysis_radardata_Group1(buffer) {
  let radarParam = {};
  let d_dataView;
  let v = null;
  for (let p in cmdParam.paramGroup1) {
    d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup1[p].offset, cmdParam.paramGroup1[p].datalen);
    switch (cmdParam.paramGroup1[p].datalen) {
      case 2:
        v = buf2int(d_dataView);
        break;
      case 4:
        v = buf2float(d_dataView);
        break;
    }
    if (p == 'dampingResult' || p == 'realtimeResult' || p == 'dampingVal' || p == 'realtimeVal') v = parseFloat(v.toFixed(4));
    if (v != null) radarParam[p] = v;
    v = null;
  }
  return radarParam;
}
/**
 * 处理分析第二数据包
 *  'paramGroup2': {
    'addr': 0x1000,//起始地址
    'registerCount': 0x40, //寄存器数量
    'offset_SensorType': 0x02, ////传感器类型 雷达型号 长度16
    'offset_DeviceSN': 0x12, //设备序列号 长度16
    'offset_ProductionDate': 0x22, //生产日期 长度8
    'offset_SoftwareVersion': 0x2A, //软件版本 长度16
    'offset_SensorShortTag': 0x5A, //短标签 长度6
    'offset_SensorLongTag': 0x60, //长标签 长度32
  },
 */
function analysis_radardata_Group2(buffer) {
  let radarParam = {};
  let d_dataView
  let v = null;
  for (let p in cmdParam.paramGroup2) {
    d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup2[p].offset, cmdParam.paramGroup2[p].datalen);
    switch (cmdParam.paramGroup2[p].datalen) {
      case 2:
        v = buf2int(d_dataView);
        break;
      case 4:
        v = buf2float(d_dataView);
        break;
      case 6:
      case 8:
      case 16:
      case 32:
        v = buf2str(d_dataView);
        if (p == 'softwareVersion')
        {
          cmdParam[p].data = v;
        }
        break;
    }
    if (v != null) radarParam[p] = v;
    v = null;
  }
  return radarParam;
}
/**
 * 处理分析第四数据包
 *   'paramGroup4': {
    'addr': 0x2000,//起始地址
    'registerCount': 0x60, //寄存器数量
    'offset_Address': 0x02, //从机地址 雷达地址
    'offset_Application': 0x10, //容器类型 0-大容积仓；1-中容积仓；2-细高仓；3-演示
    'offset_Unit': 0x12, //单位 0-m;1-cm;2-mm;3-foot;4-inch
    'offset_SensorMode': 0x14, //测量类型 0-物位；1-空高；2-距离
    'offset_DampingFilter': 0X16, //阻尼滤波器 1-600s
    'offset_ErrorTimer': 0x22, //丢波时间 故障定时器
    'offset_mAcurrentutputFunction': 0x2A, //电流输出函数 0-物位；1-空高；2-距离；3-手动模式
    'offset_mAMinimum': 0x30,	//mA 下限(m)
    'offset_mAMaximum': 0x32,	//mA 上限(m)
    'offset_mACurrentOutputMode': 0x34,	//mA 输出模式 0-手动；1-自动；2-禁用
    'offset_mAManualvalue': 0x36,	//手动值(4 - 20mA)
    'offset_mATheoreticalValue': 0x38, //mA 转换值(mA)
    'offset_SamplingTimes': 0x3C, //重复采用次数 积累次数
    'offset_Algorithm': 0x3E, //算法 0-ALF;1-A;2-L;3-F;4-AL;5-AF;6-LF;7-BLF;8-BL;9-BF;10-LAST;11-TF
    'offset_EchoThreshold': 0x40, //阈值余量
    'offset_PositionDetect': 0x42, //位置检测 0-上升；1-中心；2-混合；3-CLEF；4-MAKER
    'offset_CLEFRange': 0x44, //CLEF范围
    'offset_EchoMarker': 0x46, //回波标记
    'offset_EchoLock': 0x48,//回波锁定 0-解锁；1-跟踪；2-完全锁定
    'offset_UpSampling': 0x4A, //上采样
    'offset_DownSampling': 0x4C, //下采样
    'offset_EchoFilter': 0x50, //窄回波滤波器 0-255
    'offset_ReformEcho': 0x52, //回波整形
    'offset_HoverLevel': 0x5E, //徘徊因子
    'offset_mediumType': 0x60, //介质类型
    'offset_VesselBottom': 0x62,	//罐底类型
    'offset_SamplingCount': 0x66, //采集点数
    'offset_TVTStudyMode': 0x7C, //阈值学习模式
    'offset_TVTStudyStart': 0x7E, //阈值学习起始位置
    'offset_TVTStudyEnd': 0x82, //阈值学习起始位置
    'offset_TVTStudy': 0x86, //阈值学习状态
    'offset_NearRange': 0x88, //盲区范围
    'offset_FarRange': 0x8C, //量程范围
    'offset_LowCalib': 0x90,	//低位调整(m)
    'offset_HighCalib': 0x94,	//高位调整(m)
    'offset_SensorOffset': 0x98, //传感器自身偏移
    'offset_SensorOffsetmodify': 0x94,	//传感器修正偏移
    'offset_mA4Setpoint': 0xA0,	//4 mA 设定值(m)
    'offset_mA20Setpoint': 0xA4, //20 mA 设定值(m)
    'offset__FillRate': 0xAC,	//进料速率(m / min)(0 - 300)
    'offset_EmptyRate': 0xAE,	//出料速率(m / min)(0 - 300)
 */
function analysis_radardata_Group4(buffer) {
  let radarParam = {};
  let d_dataView;
  let v = null;
  for (let p in cmdParam.paramGroup4) {
    d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset, cmdParam.paramGroup4[p].datalen);
    switch (cmdParam.paramGroup4[p].datalen) {
      case 2:
        v = buf2int(d_dataView);
        break;
      case 4:
        v = buf2float(d_dataView);
        break;
    }
    if (p == 'echoAlgorithm')
    {
      switch (v)
      {
        case 8:
          v = 0;
          break;
        case 4:
          v = 1;
          break;
        case 5:
          v = 2;
          break;
        case 10:
          v = 3;
          break;
        default:
          v = 0;
          break;
      }
    }

    switch (p)
    {
      case 'trackingRange1':
        cmdParam[p].initData = v;
        cmdParam['trackingRange2'].initData = v;
        cmdParam['trackingRange'].initData = v;
        d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset, cmdParam.paramGroup4[p].datalen-1);
        v = d_dataView.getUint8() & 0x0F;
        break;
      case 'trackingRange2':
        cmdParam[p].initData = v;
        cmdParam['trackingRange1'].initData = v;
        cmdParam['trackingRange'].initData = v;
        d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset, cmdParam.paramGroup4[p].datalen-1);
        v = d_dataView.getUint8() >> 4;
        break;
      case 'echoThreshold':
        cmdParam[p].initData = v;
        d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset+1, cmdParam.paramGroup4[p].datalen-1);
        v = d_dataView.getUint8();
        break;
      case 'envAdaptation':
        cmdParam[p].initData = v;
        d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset+1, cmdParam.paramGroup4[p].datalen-1);
        v = d_dataView.getUint8();
        break;
      case 'trackingRange':
        cmdParam[p].initData = v;
        cmdParam['trackingRange1'].initData = v;
        cmdParam['trackingRange2'].initData = v;
        d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset+1, cmdParam.paramGroup4[p].datalen-1);
        v = d_dataView.getUint8();
        break;
      case 'trackSmooth3':
        cmdParam[p].initData = v;
        d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset, cmdParam.paramGroup4[p].datalen-1);
        v = d_dataView.getUint8() >> 4;
        break;
      case 'trackThreshold':
        cmdParam[p].initData = v;
        d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset, cmdParam.paramGroup4[p].datalen-1);
        v = d_dataView.getUint8() & 0x0F;
        break;
      case 'firstWaveEnhance':
        cmdParam[p].initData = v;
        d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset, cmdParam.paramGroup4[p].datalen-1);
        v = d_dataView.getUint8() >> 4;
        break;
      case 'curveSmooth1':
        cmdParam[p].initData = v;
        d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset+1, cmdParam.paramGroup4[p].datalen-1);
        v = d_dataView.getUint8();
        break;
      case 'curveSmooth2':
        cmdParam[p].initData = v;
        d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup4[p].offset+1, cmdParam.paramGroup4[p].datalen-1);
        v = d_dataView.getUint8();
        break;
      default:
        break;
    }

    if (p == 'TVTStudyStart' || p == 'TVTStudyEnd' || p == 'nearRange' || p == 'farRange' || p == 'lowCalib' || p == 'highCalib' || p == 'sensorOffsetmodify' || p == 'mA4Setpoint' || p == 'mA20Setpoint') v = parseFloat(v.toFixed(4));
    if (v != null) radarParam[p] = v;
    v = null;
  }
  return radarParam;
}

function analysis_radardata_Group6(buffer) {
  let radarParam = {};
  let d_dataView;
  let v = null;
  
  for (let p in cmdParam.paramGroup6) {
    d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup6[p].offset, cmdParam.paramGroup6[p].datalen);
    switch (cmdParam.paramGroup6[p].datalen) {
      case 2:
        v = buf2int(d_dataView);
        break;
      case 4:
        v = buf2float(d_dataView);
        break;
    }
    if (v != null) radarParam[p] = v;
    v = null;
  }
  return radarParam;
}


function analysis_radardata_Group7(buffer) {
  let radarParam = {};
  let d_dataView;
  let v = null;
  
  for (let p in cmdParam.paramGroup7) {
    d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup7[p].offset, cmdParam.paramGroup7[p].datalen);
    switch (cmdParam.paramGroup7[p].datalen) {
      case 2:
        v = buf2int(d_dataView);
        break;
      case 4:
        v = buf2float(d_dataView);
        break;
    }
    if (p == 'TxPower1')
    {
      switch (true) {
        case ((v & 0x0070) == 0x0040):
          v = 2;
          break;
        case ((v & 0x0070) == 0x0010):
          v = 1;
          break;
        case ((v & 0x0070) == 0x0000):
          v = 0;
          break;
        default:
          v = 0;
          break;
      }
    }

    if (p == 'RxGain')
    {
      switch (v) {
        case 0xA350:
          v = 0;
          break;
        case 0xA750:
          v = 1;
          break;
        case 0xEB50:
          v = 2;
          break;
        default:
          v = 0;
          break;
      }
    }
    if (v != null) radarParam[p] = v;
    v = null;
  }
  return radarParam;
}

// 解析蓝牙名称 和 密码
function analysis_radardata_Group5(buffer) {
  let radarParam = {};
  let d_dataView
  let v = null;
  for (let p in cmdParam.paramGroup5) {
    d_dataView = new DataView(buffer, 3 + cmdParam.paramGroup5[p].offset, cmdParam.paramGroup5[p].datalen);
    switch (cmdParam.paramGroup5[p].datalen) {
      case 2:
        v = buf2int(d_dataView);
        break;
      case 4:
        v = buf2float(d_dataView);
        break;
      case 6:
      case 8:
      case 16:
      case 20:
      case 32:
        v = buf2str(d_dataView);
        break;
    }
    if (v != null) radarParam[p] = v;
    v = null;
  }
  return radarParam;
}
/**
 * 计算PC 曲线 每个点的间距
 */
function calcPointStep(d_r, farRange, offset, samplingCountType) {
  let adcSamplingRate = 4000000;
  let samplingType = [2048, 1024, 512, 256, 128];
  let samplingCount;
  let count = 0;
  let step = 0;
  //采集次数
  samplingCount = samplingType[samplingCountType];
  count = parseInt((farRange + offset) * samplingCount / (d_r * adcSamplingRate));
  //曲线点间距
  step = d_r * adcSamplingRate / samplingCount
  //如果大于512个点
  if (count > 512) step *= 2;
  return step;
}
/**
 * 计算曲线点数
 */
function calcwavepoint(d_r, farRange, offset, samplingCountType) {
  let adcSamplingRate = 4000000;
  let samplingType = [2048, 1024, 512, 256, 128];
  let samplingCount;
  let count = 0;
  //采集次数
  samplingCount = samplingType[samplingCountType];
  //曲线点数
  count = parseInt((farRange + offset) * samplingCount / (d_r * adcSamplingRate));
  //最多512个点
  if (count > 512) count = 512;
  return count;
}

/**
 * 生产雷达命令buffer，计算crc
 */
function translate_radarcom(comdata) {
  if (!comdata.registerCount) {
    return;
  }
  let s_buffer = null;
  //创建发送buffer，长度为 地址(1)+功能码(1)+寄存器地址(2)+数据长度(2)+数据（X)+CRC(2)
  if (comdata.funcode == 0x10 || comdata.funcode == 0x48) {
    s_buffer = new ArrayBuffer(comdata.datalen2 + 9);
  } else {
    s_buffer = new ArrayBuffer(8);
  }

  //创建命令内容buf
  let d_buf = new ArrayBuffer(s_buffer.byteLength - 2);
  let radar_addr_view = new Uint8Array(d_buf, 0, 1);
  radar_addr_view[0] = comdata.radar_addr;
  //功能码
  let funcode_view = new Uint8Array(d_buf, 1, 1);
  funcode_view[0] = comdata.funcode;
  //寄存器地址
  let register_addr_view = new Uint8Array(d_buf, 2, 2);
  register_addr_view[0] = parseInt(comdata.register_addr / 0x100);
  register_addr_view[1] = comdata.register_addr % 0x100;
  //寄存器长度
  let data_len_view = new Uint8Array(d_buf, 4, 2);
  data_len_view[0] = parseInt(comdata.registerCount / 0x100);
  data_len_view[1] = comdata.registerCount % 0x100;
  if (comdata.funcode == 0x10 || comdata.funcode == 0x48) {
    //设置指令 数据长度 
    let data_view = new Uint8Array(d_buf, 6, comdata.datalen2 + 1);
    data_view[0] = comdata.datalen2;
    for (let i = 0; i < comdata.datalen2; i++) {
      data_view[i + 1] = 0;
    }
    //设置指令  数据
    switch (true) {
      case comdata.datalen2 == 2: //整型数据
        data_view[1] = parseInt(comdata.data / 0x100);
        data_view[2] = parseInt(comdata.data % 0x100);
        break;
      case comdata.datalen2 == 4: //float数据
        let f_v = Float32Array.of(parseFloat(comdata.data));
        let dv = new DataView(f_v.buffer);
        data_view[1] = dv.getUint8(1);
        data_view[2] = dv.getUint8(0);
        data_view[3] = dv.getUint8(3);
        data_view[4] = dv.getUint8(2);
        break;
      case comdata.datalen2 == 6:
      case comdata.datalen2 == 8: //字符串数据
      case comdata.datalen2 == 12:
      case comdata.datalen2 == 20: //字符串数据
        let str = comdata.data.slice(0, comdata.datalen2);
        for (let i = 0; i < str.length; i++) {
          data_view[i + 1] = str.charCodeAt(i);
        }
        break;
    }
  }

  //计算CRC16
  let crc_buf = get_crc16(d_buf);
  let crc_view = new Uint8Array(crc_buf);
  //填充发送buf
  let s_view = new Uint8Array(s_buffer);
  let d_view = new Uint8Array(d_buf);
  s_view.set(d_view);
  s_view.set(crc_view, d_buf.byteLength);
  return s_buffer;
}
/**
 *  计算CRC16字符串，低位在前
 *  @param: sendbtyes string Modbus发送字符串
 *  @return: 返回一个2字节btyes string
 */
function get_crc16(buffer) {
  if (!buffer.byteLength) {
    return new ArrayBuffer(0);
  }
  let data_view = new Uint8Array(buffer)
  let crc = 0xFFFF;
  data_view.forEach((b) => {
    crc = crc ^ b
    for (let i = 0; i < 8; i++) {
      if ((crc & 0x0001) == 0x0001) {
        crc = (crc >> 1) ^ 0xA001;
      } else {
        crc = crc >> 1;
      }
    }
  });
  let crc_buf = new ArrayBuffer(2);
  let dataview = new Uint16Array(crc_buf);
  dataview.set([crc]);
  return crc_buf;
}

module.exports = {
  w_analysis_radardata: w_analysis_radardata,
  analysis_radardata: analysis_radardata,
  translate_radarcom: translate_radarcom,
  calcPointStep: calcPointStep,
  calcwavepoint: calcwavepoint,
  buf2int: buf2int,
  buf2float: buf2float,
}