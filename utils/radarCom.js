const RADARADDR = 1;
const TIMEOUT = 5000;
const RESENT = 1000;
import {
  bledevice
} from './bledevice'

import {
  cmdParam
} from './cmdparam'
import {
  w_cmdParam
} from './w_cmdparam'
import {
  translate_radarcom,
  analysis_radardata,
  w_analysis_radardata,
} from './analysisradardata'
import { w_setList } from './w_setmenu';

var lang = require('./languageUtils');

var app = getApp();

function radarCom() {
  this.logincount = 0;
  this.bleName = '';
  this.bleUUID = '';
  this.loginKey = '';
  this.bleLoginState = false;
  this.bleDevice = null;
  this.bleConnectState = false;
  this.bleNotifyState = false;
  this.recBuf = null;
  this.radarInfo = {};
  this.commErrorCount = 0;
  this.cmdList = [];
  this.cmdCount = 0;
  this.getRadarDataParam = {
    stop: true
  };
  this.farRange = null;
  this.readWaveState = 0;
  this.is_direct_send = false;
  this.sendCmd_IntervalIdx = 0;
  this.getRadarData_IntervalIdx = 0;
  this.getWaterLevel_IntervalIdx = 0;
  this.getWaterEcho_IntervalIdx = 0;
  this.getRange_IntervalIdx = 0;
  this.getWaterThreadhold_IntervalIdx = 0;
  this.errCheck_intervalIdx = 0;
  this.device_type = '物位计';
  this.current_com = '读水位';
  this.modbus_addr = 0x01;
  this.is_frame_rec = false;
  this.curveSendTimes = 8;
  this.lastSendCountPoint = 0;
  this.DR = null;
  this.ADCSampleRate = null;
  this.sensorSelfOffset = null;
  this.isInitFinish = false;
  this.isModifyInternal = false;
  this._lang = lang._lang();
  this.softwareVersion = '';

  // 回调句柄
  this.callback_updateRadarInfo = null;
  this.callback_bleConnected = null;
  this.callback_bleDisconnected = null;
  this.callback_bleLoginStateChange = null;
  this.callback_blerec = null;
  this.callback_directSendRec = null;
  this.callback_initInfoRec = null;
  this.callback_updateEcho = null;
  this.callback_updateThreadhold = null;
  this.callback_initGetDR = null;
  this.callback_updateWaterLevel = null;
  this.callback_initGetSensorSelfOffset = null;
  this.callback_initGetADCSampleRate = null;
  this.callback_initGetDeviceSN = null;
  this.callback_directSetRec = null;
  // 远程协助
  this.remoteAssistanceStatus = false;

  // 初始化
  this.init = (uuid = '') => {
    if (app.globalData.ble_device == null)
    {
      app.globalData.ble_device = new bledevice(uuid);
    }
    app.globalData.ble_device.device_type = this.device_type;
    //绑定 接收信息的回调函数
    app.globalData.ble_device.callback_blerec = this.onBLERec;
    // 绑定 蓝牙 连接 断开信息
    app.globalData.ble_device.callback_bleConnected = this.onBLEConnect;
    app.globalData.ble_device.callback_bleDisconnected = this.onBLEDisconnect;
    app.globalData.ble_device.callback_bleNotifyState = this.onNotifyStateChange;
    // 周期请求雷达信息 向雷达发送命令
    
    this.modbus_addr = app.globalData.modbus_addr;
    this.readWaveState = 0;
    this.sendCmdByCycle();
  };

  // 开始周期向雷达发送信息和命令
  this.sendCmdByCycle = () => {
    
      switch (this.device_type)
      {
          case '物位计':
              if (this.getRadarData_IntervalIdx) clearInterval(this.getRadarData_IntervalIdx);

              // 周期添加雷达信息查询命令
              this.getRadarData_IntervalIdx = setInterval(() => {
                this.getRadarData();
              }, 1000);
              if (this.sendCmd_IntervalIdx) clearInterval(this.sendCmd_IntervalIdx);
              
              // 周期向BLE发送雷达命令
              this.sendCmd_IntervalIdx = setInterval(() => {
                this.sendCmd();
              }, 1500);
              break;
          
          case '水位计':
              this.getWaterLevel_IntervalIdx = setInterval(() => {
                if (this.isInitFinish == true)
                {
                  if (this.isModifyInternal == false)
                  {
                    clearInterval(this.sendCmd_IntervalIdx);
                    this.sendCmd_IntervalIdx = setInterval(() => {
                      this.sendCmd();
                    }, 500);
                    this.isModifyInternal = true;
                  }
                  this.w_ScheduledTask();
                }
              }, 10000);

              this.sendCmd_IntervalIdx = setInterval(() => {
                this.sendCmd();
              }, 300);

              break;
          
          default:
              break;
      }
  };

  // 停止周期向雷达发送信息和命令
  this.stopSendCmdByCycle = () => {
    var that = this;
    console.log('断开');
    that.clearcomlist(1);
    if (that.getRadarData_IntervalIdx) clearInterval(that.getRadarData_IntervalIdx);
    if (that.sendCmd_IntervalIdx) clearInterval(that.sendCmd_IntervalIdx);
    if (that.getWaterLevel_IntervalIdx) clearInterval(that.getWaterLevel_IntervalIdx);
    if (that.getWaterEcho_IntervalIdx) clearInterval(that.getWaterEcho_IntervalIdx);
    if (that.getRange_IntervalIdx) clearInterval(that.getRange_IntervalIdx);
    if (that.getWaterThreadhold_IntervalIdx) 
    {
      clearInterval(that.getWaterThreadhold_IntervalIdx);
      console.log('关定时任务')
    }
    this.sendCmd_IntervalIdx = 0;
    this.getRadarData_IntervalIdx = 0;
    this.getWaterLevel_IntervalIdx = 0;
    this.getWaterEcho_IntervalIdx = 0;
    this.getRange_IntervalIdx = 0;
    this.getWaterThreadhold_IntervalIdx = 0;
  };

  // 连接android蓝牙 开始监听数据 
  this.connectBle = (bleUUID = '') => {
    if (bleUUID.length == 0) return false;
    // 如果蓝牙已经连接 断开当前蓝牙连接
    if (app.globalData.ble_device && this.bleConnectState) app.globalData.ble_device.closeBLEConnection();
    //连接蓝牙设备，显示蓝牙状态
    app.globalData.ble_device.connectBle(bleUUID);
  };

  // 断开蓝牙连接
  this.disConnectBle = () => {
    if (app.globalData.ble_device) app.globalData.ble_device.closeBLEConnection();
    this.stopSendCmdByCycle();
    this.clearcomlist(1);
  };

  // 发送登录信息
  this.loginBLE = () => {
    let that = this;
    let app = getApp();
    
    switch (this.device_type)
    {
      case '物位计':
        if (that.loginKey.length != 6) {
          // 密码不是六位 长度非法
          this.disConnectBle();
          this.bleLoginState = false;
          if (this.callback_bleLoginStateChange) this.callback_bleLoginStateChange(this.bleLoginState);
          wx.showToast({
            title: this._lang['密码长度错误'],
            image: '../../images/error.png',
            duration: 1000
          });
        } else {
          // 发送登录密码
          this.add2cmdList({
            radar_addr: RADARADDR,
            funcode: cmdParam.fc_Set,
            register_addr: cmdParam.bleLogin.addr,
            registerCount: cmdParam.bleLogin.registerCount,
            datalen2: cmdParam.bleLogin.dataLen,
            data: that.loginKey,
          });
        }
        break;

      case '流速计':
      case '水位计':
        if (that.loginKey.length != 6) {
          // 密码不是六位 长度非法
          this.disConnectBle();
          this.bleLoginState = false;
          if (this.callback_bleLoginStateChange) this.callback_bleLoginStateChange(this.bleLoginState);
          wx.showToast({
            title: this._lang['密码长度错误'],
            image: '../../images/error.png',
            duration: 1000
          });
        } else {
          // 发送登录密码
          app.globalData.ble_device.w_sendData(translate_radarcom({
            radar_addr: app.globalData.modbus_addr,
            funcode: cmdParam.fc_Set,
            register_addr: cmdParam.bleLogin.addr,
            registerCount: cmdParam.bleLogin.registerCount,
            datalen2: cmdParam.bleLogin.dataLen,
            data: this.loginKey,
          }), app.globalData.ble_device.seruuid, app.globalData.ble_device.charuuid);

          this.onBLELoginBack(true);
        }
        break;

      default:
        break;
    }
  };

  // 添加雷达设置命令
  this.setRadarCmd = (cmd) => {
    let data;
    for (let c in cmd) {
      switch (c)
      {
        case 'trackingRange1':
          cmdParam[c].initData = cmdParam[c].initData & 0xF0FF;
          cmdParam[c].initData = cmdParam[c].initData | (cmd[c]<<8);
          data = cmdParam[c].initData;
          break;
        case 'trackingRange2':
          cmdParam[c].initData = cmdParam[c].initData & 0x0FFF;
          cmdParam[c].initData = cmdParam[c].initData | (cmd[c]<<12);
          data = cmdParam[c].initData;
          break;
        case 'echoThreshold':
          cmdParam[c].initData = cmdParam[c].initData & 0xFF00;
          cmdParam[c].initData = cmdParam[c].initData | cmd[c];
          data = cmdParam[c].initData;
          break;
        case 'envAdaptation':
          cmdParam[c].initData = cmdParam[c].initData & 0xFF00;
          cmdParam[c].initData = cmdParam[c].initData | cmd[c];
          data = cmdParam[c].initData;
          break;
        case 'trackingRange':
          cmdParam[c].initData = cmdParam[c].initData & 0xFF00;
          cmdParam[c].initData = cmdParam[c].initData | (cmd[c]);
          data = cmdParam[c].initData;
          break;
        case 'trackSmooth3':
          cmdParam[c].initData = cmdParam[c].initData & 0x0FFF;
          cmdParam[c].initData = cmdParam[c].initData | (cmd[c]<<12);
          data = cmdParam[c].initData;
          break;
        case 'trackThreshold':
          cmdParam[c].initData = cmdParam[c].initData & 0xF0FF;
          cmdParam[c].initData = cmdParam[c].initData | (cmd[c]<<8);
          data = cmdParam[c].initData;
          console.log(data);
          break;
        case 'firstWaveEnhance':
          cmdParam[c].initData = cmdParam[c].initData & 0x0FFF;
          cmdParam[c].initData = cmdParam[c].initData | cmd[c]<<12;
          data = cmdParam[c].initData;
          break;
        case 'curveSmooth1':
          cmdParam[c].initData = cmdParam[c].initData & 0xFF00;
          cmdParam[c].initData = cmdParam[c].initData | cmd[c];
          data = cmdParam[c].initData;
          break;
        case 'curveSmooth2':
          cmdParam[c].initData = cmdParam[c].initData & 0xFF00;
          cmdParam[c].initData = cmdParam[c].initData | cmd[c];
          data = cmdParam[c].initData;
          break;
        case 'echoAlgorithm':
          if (cmd[c] == 0)
          {
            data = 8;
          }
          else if (cmd[c] == 1)
          {
            data = 4;
          }
          else if (cmd[c] == 2)
          {
            data = 5;
          }
          else
          {
            data = 10;
          }
          break;
        case 'RxGain':
          switch (cmd[c]) {
            case '0':
              data = 0xA350;
              break;
            case '1':
              data = 0xA750;
              break;
            case '2':
              data = 0xEB50;
              break;
          }
          
          break;
        case 'TxPower1':
          switch (cmd[c]) {
            case '0':
              data = 0x0000;
              break;
            case '1':
              data = 0x9210;
              break;
            case '2':
              data = 0x9240;
              break;
          }
            
        default:
          data = cmd[c];
          break;
      }

      if (c == 'TxPower1'  || c == 'RxGain')
      {
        this.add2cmdList({
          radar_addr: RADARADDR,
          funcode: cmdParam.fc_Set2,
          register_addr: cmdParam[c].addr,
          registerCount: cmdParam[c].registerCount,
          datalen2: cmdParam[c].dataLen,
          data: data,
        });
      }
      else
      {
        this.add2cmdList({
          radar_addr: RADARADDR,
          funcode: cmdParam.fc_Set,
          register_addr: cmdParam[c].addr,
          registerCount: cmdParam[c].registerCount,
          datalen2: cmdParam[c].dataLen,
          data: data,
        });
      }
    }
  };

  // 读取雷达参数信息
  this.getRadarparam = (clear) => {
    // 未完成登录
    if (!this.bleLoginState) return;

    if (clear) {
      //清空当前命令列表
      this.clearcomlist();
    }

    this.add2cmdList({
      radar_addr: RADARADDR,
      funcode: cmdParam.fc_Read2,
      register_addr: cmdParam.paramGroup2.addr,
      registerCount: cmdParam.paramGroup2.registerCount,
    });
    this.add2cmdList({
      radar_addr: RADARADDR,
      funcode: cmdParam.fc_Read2,
      register_addr: cmdParam.paramGroup4.addr,
      registerCount: cmdParam.paramGroup4.registerCount,
    });
    this.add2cmdList({
      radar_addr: RADARADDR,
      funcode: cmdParam.fc_Read2,
      register_addr: cmdParam.paramGroup5.addr,
      registerCount: cmdParam.paramGroup5.registerCount,
    });
    this.add2cmdList({
      radar_addr: RADARADDR,
      funcode: cmdParam.fc_Read2,
      register_addr: cmdParam.paramGroup6.addr,
      registerCount: cmdParam.paramGroup6.registerCount,
    });
    this.add2cmdList({
      radar_addr: RADARADDR,
      funcode: cmdParam.fc_Read3,
      register_addr: cmdParam.paramGroup7.addr,
      registerCount: cmdParam.paramGroup7.registerCount,
    });
    // this.add2cmdList({
    //   radar_addr: RADARADDR,
    //   funcode: cmdParam.fc_Read2,
    //   register_addr: cmdParam.RxGain.addr,
    //   registerCount: cmdParam.RxGain.registerCount,
    // });
  };

  // 开始/停止 周期读取雷达信息
  this.getRadarData = () => {
    // 未完成登录
    if (!this.bleLoginState) return;
    // 停止周期读取数据
    if (this.getRadarDataParam.stop) return;
    // 仍有命令未发送完成
    if (this.cmdList.length) return;
    // 远程协助标示位打开 本地不再与雷达主动通讯
    if (this.remoteAssistanceStatus) return;
    // 读取测量信息
    if (this.getRadarDataParam.radarData) {
      this.add2cmdList({
        radar_addr: RADARADDR,
        funcode: cmdParam.fc_Read,
        register_addr: cmdParam.paramGroup1.addr,
        registerCount: cmdParam.paramGroup1.registerCount,
      });
    }
    // 读取LCD曲线信息
    if (this.getRadarDataParam.radarLCDWave) {
      //LCD读回波曲线 start
      this.add2cmdList({
        radar_addr: RADARADDR,
        funcode: cmdParam.fc_Set,
        register_addr: cmdParam.readLCD.addr,
        registerCount: cmdParam.readLCD.registerCount,
        datalen2: cmdParam.readLCD.dataLen,
        data: cmdParam.readLCD.start,
      });
      // 读取LCD FFT TVT曲线
      this.add2cmdList({
        radar_addr: RADARADDR,
        funcode: cmdParam.fc_Read,
        register_addr: cmdParam.lcdCurvedata.addr,
        registerCount: cmdParam.lcdCurvedata.registerCount,
      });
      // //LCD读回波曲线FFT
      // this.add2cmdList({
      //   radar_addr: RADARADDR,
      //   funcode: cmdParam.fc_Read,
      //   register_addr: cmdParam.lcdFFTdata.addr,
      //   registerCount: cmdParam.lcdFFTdata.registerCount,
      // });
      // //LCD读回波曲线TVT
      // this.add2cmdList({
      //   radar_addr: RADARADDR,
      //   funcode: cmdParam.fc_Read,
      //   register_addr: cmdParam.lcdTVTdata.addr,
      //   registerCount: cmdParam.lcdTVTdata.registerCount,
      // });
    }
  };

  this.w_ScheduledTask = () => {
      this.get_profile()
  };

  this.get_profile = () => {
    let i = 0;
      
    this.getWaterLevel();

    this.add2cmdList({
      radar_addr: this.modbus_addr,
      funcode: w_cmdParam.fc_Set,
      register_addr: w_cmdParam.uploadWave.addr,
      registerCount: w_cmdParam.uploadWave.registerCount,
      datalen2: w_cmdParam.uploadWave.dataLen,
      data: w_cmdParam.uploadWave.start,
      cmdType: 'isStartOrFinishReadWave',
    });

    for (i=0; i< app.globalData.rad_com.curveSendTimes; i++)
    {
      this.add2cmdList({
        radar_addr: this.modbus_addr,
        funcode: w_cmdParam.fc_Read,
        register_addr: w_cmdParam.queryThreadholdCurve.addr + w_cmdParam.queryThreadholdCurve.list[i].id * w_cmdParam.queryThreadholdCurve.list[i].registerCount,
        registerCount: w_cmdParam.queryThreadholdCurve.list[i].registerCount,
        cmdType: 'isThreadhold',
        id: w_cmdParam.queryThreadholdCurve.list[i].id,
        lastFrame: false,
      });
    }
    
    this.add2cmdList({
      radar_addr: this.modbus_addr,
      funcode: w_cmdParam.fc_Read,
      register_addr: w_cmdParam.queryThreadholdCurve.addr + w_cmdParam.queryThreadholdCurve.list[i].id * w_cmdParam.queryThreadholdCurve.list[i].registerCount,
      registerCount: parseInt(this.lastSendCountPoint),
      cmdType: 'isThreadhold',
      id: i,
      lastFrame: true,
    });
    
    for (i=0; i< app.globalData.rad_com.curveSendTimes; i++)
    {
      this.add2cmdList({
        radar_addr: this.modbus_addr,
        funcode: w_cmdParam.fc_Read,
        register_addr: w_cmdParam.queryEchoCurve.addr + w_cmdParam.queryEchoCurve.list[i].id * w_cmdParam.queryEchoCurve.list[i].registerCount,
        registerCount: w_cmdParam.queryEchoCurve.list[i].registerCount,
        cmdType: 'isEcho',
        id: w_cmdParam.queryEchoCurve.list[i].id,
        lastFrame: false,
      });
    }

    this.add2cmdList({
      radar_addr: this.modbus_addr,
      funcode: w_cmdParam.fc_Read,
      register_addr: w_cmdParam.queryEchoCurve.addr + w_cmdParam.queryEchoCurve.list[i].id * w_cmdParam.queryEchoCurve.list[i].registerCount,
      registerCount: parseInt(this.lastSendCountPoint),
      cmdType: 'isEcho',
      id: i,
      lastFrame: true,
    });
  };

  this.getWaterLevel = () => {
      this.add2cmdList({
          radar_addr: this.modbus_addr,
          funcode: w_cmdParam.fc_Read,
          register_addr: w_cmdParam.queryMeasureResult.addr,
          registerCount: w_cmdParam.queryMeasureResult.registerCount,
          cmdType: 'isGetWaterlevel'
      });
  };

  this.get_rangeRange = () => {
      this.add2cmdList({
          radar_addr: this.modbus_addr,
          funcode: w_cmdParam.fc_Read2,
          register_addr: w_cmdParam.rangeRange.addr,
          registerCount: w_cmdParam.rangeRange.registerCount,
      });
  };

  this.clearcomlist = (force = 0) => {
    let that = this;
    if (!that.cmdList.length) {
      return;
    }
    // 强制清空
    if (force) {
      that.cmdList = [];
      return;
    }
    //清除命令列表中 保留：已发送命令、设置命令、雷达参数读取命令
    that.cmdList = that.cmdList.filter((c) => {
      return c.send_state || c.funcode == 0x10 || c.register_addr == 0x1000 || c.register_addr == 0x2000
    });
  };

  // 向命令列表添加命令
  this.add2cmdList = (comdata) => {
    let that = this;
    //如果有重复命令，则不添加命令队列
    for (let cmd of that.cmdList) {
      if (cmd.radar_addr == comdata.radar_addr &&
        cmd.funcode == comdata.funcode &&
        cmd.register_addr == comdata.register_addr &&
        cmd.registerCount == comdata.registerCount &&
        cmd.datalen2 == comdata.datalen2 &&
        cmd.data == comdata.data) {
        return;
      }
    }
    //如果没有相同的待发送命令，则添加命令列表
    that.cmdList.push(comdata);
  };

  // 向蓝牙发送命令 重发 以及 超时处理
  this.sendCmd = (buf) => {
    if (this.is_frame_rec == true) return;
    
    let that = this;
    let date1 = new Date();
    let t1 = date1.getSeconds() + ':' + date1.getMilliseconds();
    
    // 判断是否远程协助状态 如果是 跳过读取自身命令列表 直接发送参数buf
    if (this.remoteAssistanceStatus && buf) {
      app.globalData.ble_device.sendData(buf);
      let register_addr = new Uint16Array(buf, 2, 2);
      console.log(`${t1}--remote send addr:${register_addr[0].toString(16)}`)
      return;
    }

    //判断蓝牙状态 和 是否有待发命令
    if (!that.cmdList.length || !that.bleConnectState || !that.bleNotifyState) {
      return;
    }
    let now_time = date1.getTime();
    let comdata = that.cmdList[0];

    //判断命令发送状态，未发送->发送，已发送判断超时
    if (comdata.send_state) {
      //判断延时，
      if (now_time - comdata.send_time > TIMEOUT) {
        // 超时 删除第一个发送命令
        that.cmdList.shift();
        if (that.bleLoginState) {
          //如果已经成功登录 通讯失败计次+1
          that.commErrorCount++;
        } else {
          // 如果未成功登录 登录失败 断开BLE连接
          that.disConnectBle();
        }
      } else if (now_time - comdata.send_time > RESENT) {
        // 重发
        console.log(now_time - comdata.send_time);
        app.globalData.ble_device.sendData(translate_radarcom(comdata), true);
        console.log(`${t1}--resend addr:${comdata.register_addr}`);
        that.cmdList[0].send_time = now_time;
      }
    } else {
      //发送
      app.globalData.ble_device.sendData(translate_radarcom(comdata), true);
      console.log(`${t1}--send addr:${comdata.register_addr}`);
      //设置命令发送状态和时间
      that.cmdList[0].send_state = true;
      that.cmdList[0].send_time = now_time;
    }
  };

  this.directSendCmd = (comData) => {
    app.globalData.ble_device.sendData(translate_radarcom(comData), true);
    this.is_direct_send = true;
  }

  this.level_ble_rec_handle = (buf) => {
    let that = this;

    if (!buf || buf.byteLength < 3) {
      return;
    }

    //判断数据包是否完整，续包
    if (that.recBuf == null) { //数据缓存为空，接收新数据包
      let dataView = new DataView(buf);
      //雷达地址
      let addr = dataView.getUint8(0);
      //功能码  
      let funcode = dataView.getUint8(1);
      //得到数据长度
      let datalen = dataView.getUint8(2);
      //检查数据包头是否正确
      if (addr == RADARADDR && (funcode == 0xE6 || funcode == 0x10 || funcode == 0x03 || funcode == 0x04 || funcode == 0x46 || funcode == 0x48)) {
        that.recBuf = new ArrayBuffer(buf.byteLength);
        let recView = new Uint8Array(that.recBuf);
        let dView = new Uint8Array(buf);
        recView.set(dView);

        if (funcode != 0x10 && datalen + 5 > buf.byteLength) {
          console.log('续包')
          return; //数据包不完整 等待下一个数据包
        }
      } else {
        //数据包头不正确，清空缓存
        that.recBuf = null;
        return;
      }
    } else { //数据缓存非空，续包 当前只支持一次续包
      let dView = new Uint8Array(buf);
      let recView = new Uint8Array(that.recBuf);
      let tempBuf = new ArrayBuffer(dView.byteLength + recView.byteLength);
      let tempView = new Uint8Array(tempBuf);
      tempView.set(recView);
      tempView.set(dView, recView.byteLength);
      that.recBuf = tempBuf;
    }

    // 判断是否远程协助状态 如果是 直接回传数据
    if (this.remoteAssistanceStatus) {
      if (this.callback_blerec) this.callback_blerec(that.recBuf);
      this.recBuf = null;
      return;
    }

    //判断是否有已发送命令
    if (!that.cmdList.length || !that.cmdList[0].send_state) {
      //清空数据缓存
      this.recBuf = null;
      return;
    }

    //解析接收的字符串
    var radarParam = analysis_radardata(that.recBuf, that.cmdList[0].register_addr);

    //清空数据缓存
    this.recBuf = null;

    if (!radarParam) {
      return;
    }

    //接收到合格的回复信息，连续通讯失败计次清零
    that.commErrorCount = 0;
    // 已响应命令 删除
    let comdata = that.cmdList[0]
    let date = new Date()
    let t = date.getSeconds() + ':' + date.getMilliseconds()

    // 由于设置命令回复时间较长 所以对settingBack类型回复进行判断，是否相应的发送命令已经从队列中删除
    if (radarParam.dataType == 'settingBack' && radarParam.rec_register_addr != that.cmdList[0].register_addr) { } else {
      that.cmdList.shift();
    }
    
    // 分类处理 雷达回复数据
    switch (radarParam.dataType) {
      case 'radarInfo':

      case 'radarParam':

      case 'LCDWave':
        that.updataRadarInfo(radarParam);
        break;

      case 'settingBack':
        // 雷达设置命令回复信息  重新读取雷达参数
        let register_addr = radarParam.rec_register_addr;
        // 收到登录成功回复
        if (register_addr == cmdParam.bleLogin.addr) this.onBLELoginBack(true);
        if (register_addr != cmdParam.readLCD.addr && register_addr != cmdParam.readFFT.addr) {
          //除曲线请求外的设置回复命令，需更新雷达信息
          that.getRadarparam(1);
          // console.log('settingBack!  register_addr:' + s_com.register_addr + "; readLCD_addr:" + cmdParam.readLCD.addr)
        }
        break;
        
      case 'connTest':
        //目前未处理！！！！！
        break;
    }
  }

  this.water_ble_rec_handle = (buf) => {
    let that = this;
    let t_id;
    let last_frame;
    
    if (!buf || buf.byteLength < 3) {
      return;
    }

    //判断数据包是否完整，续包
    if (that.recBuf == null) { //数据缓存为空，接收新数据包
      let dataView = new DataView(buf);
      let addr = dataView.getUint8(0);
      let funcode = dataView.getUint8(1);
      let datalen = dataView.getUint8(2);
      let add_high = dataView.getUint8(2);
      let add_low = dataView.getUint8(3);
      
      if (add_high == 0x30 && add_low == 0x0d)
      {
        return;
      }

      if (addr == this.modbus_addr && (funcode == 0xE6 || funcode == 0x10 || funcode == 0x03 || funcode == 0x04)) {
        that.recBuf = new ArrayBuffer(buf.byteLength);
        let recView = new Uint8Array(that.recBuf);
        let dView = new Uint8Array(buf);
        recView.set(dView);

        if (funcode != 0x10 && datalen + 5 > buf.byteLength) {
          return;
        }
      } else {
        that.recBuf = null;
        return;
      }
    } else {
      let dView = new Uint8Array(buf);
      let recView = new Uint8Array(that.recBuf);
      let tempBuf = new ArrayBuffer(dView.byteLength + recView.byteLength);
      let tempView = new Uint8Array(tempBuf);
      tempView.set(recView);
      tempView.set(dView, recView.byteLength);
      that.recBuf = tempBuf;
    }

    if (!that.cmdList.length || !that.cmdList[0].send_state) {
      this.recBuf = null;
      return;
    }

    try
    {
      t_id = that.cmdList[0].id;
    }
    catch
    { }
    
    switch (that.cmdList[0].cmdType)
    {
      case 'isGetSensorSelfOffset':
        this.cmdList.shift();
        this.callback_initGetSensorSelfOffset(that.recBuf);
        this.recBuf = null;
        break;

      case 'isGetWaterlevel':
        this.cmdList.shift();
        this.callback_updateWaterLevel(that.recBuf);
        this.recBuf = null;
        break;

      case 'isGetDR':
        that.cmdList.shift();
        this.callback_initGetDR(that.recBuf);
        this.recBuf = null;
        break;

      case 'isGetADCSampleRate':
        that.cmdList.shift();
        this.callback_initGetADCSampleRate(that.recBuf);
        this.recBuf = null;
        break;

      case 'isSet':
        that.cmdList.shift();
        this.is_direct_send = false;
        this.recBuf = null;
        break;

      case 'isDirectSend':
        switch (that.cmdList[0].directType)
        {
          case 'set':
            that.cmdList.shift();
            this.callback_directSetRec(t_id);
            this.recBuf = null;
            break;
          case 'read':
            that.cmdList.shift();
            this.callback_directSendRec(that.recBuf);
            this.is_direct_send = false;
            this.recBuf = null;
            break;
          default:
            break;
        }
        break;

      case 'isInit':
        that.cmdList.shift();
        this.callback_initInfoRec(that.recBuf, t_id);
        this.recBuf = null;
        if (t_id == w_setList.length-1)
        {
          this.isInitFinish = true;
        }
        break;

      case 'isEcho':
        if (that.cmdList[0].lastFrame)
        {
          last_frame = true;
        } else {
          last_frame = false;
        }

        that.cmdList.shift();
        this.callback_updateEcho(that.recBuf, t_id, last_frame)
        this.recBuf = null;
        break;

      case 'isThreadhold':
        if (that.cmdList[0].lastFrame)
        {
          last_frame = true;
        } else {
          last_frame = false;
        }
        that.cmdList.shift();
        this.callback_updateThreadhold(that.recBuf, t_id, last_frame)
        this.recBuf = null;
        break;
        
      case 'isStartOrFinishReadWave':
        that.cmdList.shift();
        this.recBuf = null;
        break;

      case 'isGetdeviceSN':
        that.cmdList.shift();
        this.callback_initGetDeviceSN(that.recBuf);
        this.recBuf = null;
        break;

      default:
        break;
    }
  }

  // 蓝牙信息接收
  this.onBLERec = (buf) => {
    this.is_frame_rec = true;
    //空返回
    switch (this.device_type)
    {
      case '物位计':
        this.level_ble_rec_handle(buf);
        break;

      case '水位计':
        this.water_ble_rec_handle(buf);
        break;
    }
    this.is_frame_rec = false;
  };

  // 更新雷达信息
  this.updataRadarInfo = (radarInfo) => {
    let v = null;
    switch (this.device_type)
    {
      case '物位计':
        if (this.radarInfo == null) info = {};
        switch (radarInfo.dataType) {
          case 'radarParam':
          case 'radarInfo':
            // 更新雷达参数
            for (let p in radarInfo) {
              v = radarInfo[p];
              if (v != null) this.radarInfo[p] = v;
            }
            break;

          case 'LCDWave':
            // 更新曲线信息
            this.radarInfo.dataType = radarInfo.dataType;
            this.radarInfo.lcd_echoCurve = radarInfo.lcd_echoCurve.slice(0);
            this.radarInfo.lcd_TVTModifyCurve = radarInfo.lcd_TVTModifyCurve.slice(0);
            break;
        }
        // 执行雷达信息更新的回调函数
        if (this.callback_updateRadarInfo) this.callback_updateRadarInfo(this.radarInfo);
        break;

      case '水位计':
        switch (radarInfo.dataType) {
          case 'radarInfo':
            // 更新雷达参数
            this.radarInfo.dataType = radarInfo.dataType;
            for (let p in radarInfo) {
              v = radarInfo[p];
              if (v != null) this.radarInfo[p] = v;
            }
            break;
          
          case 'radarParam':
            if (radarInfo.farRange)
            {
              this.radarInfo.farRange = radarInfo.farRange;
              clearInterval(this.getRange_IntervalIdx);
            }

            break;

          case 'LCDWave':
            this.radarInfo.dataType = radarInfo.dataType;
            if (radarInfo.lcd_echoCurve)
            {
              this.radarInfo.lcd_echoCurve = radarInfo.lcd_echoCurve.slice(0);
            }

            if (radarInfo.lcd_TVTModifyCurve)
            {
              this.radarInfo.lcd_TVTModifyCurve = radarInfo.lcd_TVTModifyCurve.slice(0);
            }
            break; 
        } 

        if (this.callback_updateRadarInfo) this.callback_updateRadarInfo(this.radarInfo);
        break;
    }
  };

  // 蓝牙连接信息
  this.onBLEConnect = () => {
    this.bleConnectState = true;
    // 清空雷达信息
    this.radarInfo = {};
    this._lang = lang._lang();
    // 显示蓝牙连接成功
    wx.showToast({
      title: this._lang['蓝牙已连接'],
      image: '../../images/btcon.png',
      duration: 3000
    });
    if (this.callback_bleConnected) this.callback_bleConnected();
  };

  // 蓝牙断开信息
  this.onBLEDisconnect = () => {
    this.bleConnectState = false;
    this.loginKey = '';
    app.globalData.ble_device.loginKey = '';
    // 雷达命令列表清空
    this.cmdList = [];
    // 判断是否是登录失败
    if (!this.bleLoginState) {
      // 如果 还未登录 登录失败
      this.onBLELoginBack(false);
    }
    // 停止周期读取雷达 测量信息 和 LCD曲线
    this.getRadarDataParam = {
      stop: true,
    }
    if (this.callback_bleDisconnected) this.callback_bleDisconnected();
  };

  // 蓝牙开始监听数据
  this.onNotifyStateChange = (flag) => {
    this.bleNotifyState = flag;
    // 蓝牙开始接收数据
    if (this.bleNotifyState) {
      // 登陆雷达
      this.loginBLE();
    } else {
      // 停止周期读取雷达 测量信息 和 LCD曲线
      this.getRadarDataParam = {
        stop: true,
      }
    }
  };

  // 登录操作反馈
  this.onBLELoginBack = (flag) => {
    this.bleLoginState = flag;
    if (this.callback_bleLoginStateChange) this.callback_bleLoginStateChange(this.bleLoginState);
    this._lang = lang._lang();

    switch (this.device_type)
    {
      case '物位计':
        if (flag) {
          // 开始周期读取雷达 测量信息 和 LCD曲线
          this.getRadarDataParam = {
            radarData: true,
            radarLCDWave: true,
          }
        } else {
          if (this.bleConnectState) this.disConnectBle();
          wx.showToast({
            title: this._lang['登陆未成功'],
            image: '../../images/error.png',
            duration: 3000
          });
        }
        break;

      case '水位计':
        if (flag) {
          console.log("水位计登录成功");
        } else {
          if (this.bleConnectState) this.disConnectBle();
          wx.showToast({
            title: this._lang['登陆未成功'],
            image: '../../images/error.png',
            duration: 3000
          });
        }
        break;

      default:
        break;
    }
  };
}

module.exports = {
  radarCom: radarCom
}