// component/radar-set/radar-set.js
var lang = require('../../utils/languageUtils');


Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    _lang: {
      type: Object,
      value: lang._lang(),
    },
    loggedIn:{
      type:Boolean,
      value:false,
    },
    setMenu: {
      type: Object,
      value: null
    },
    radarInfo: {
      type: Object,
      value: null,
      observer: 'dis_Menu'
    },
    versionReq: {
      type: Boolean,
      value: false,
    },
    activePasswordEnter: {
      type: Boolean,
      value: true,
    },
    activePassword: {
      type: String,
      value: '',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    activeKeyVerify_IntervalIdx: 0,
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    activeKeyVerify()
    {
      let total = this.genarateActivePassword();
      if (this.properties.activePassword != total)
      {
        this.setData({
          'activePasswordEnter': false,
        });
      }
    },

    // 设置雷达参数
    cat_SetValue(e) {
      let that = this;
      let idx = parseInt(e.target.id);
      let count = 0;
      let variable;
      let menu = this.data.setMenu;
      let setCmd = {};
      //震动提示
      wx.vibrateLong();
      //遍历设置组下每个设置项，有变化的发送设置命令
      for (var i in menu[idx].settings) {
        if (menu[idx].settings[i].value != menu[idx].settings[i].baseValue) {
          variable = menu[idx].settings[i].variable;
          let v = menu[idx].settings[i].value
          // 内容为空 不执行
          if (v === '') continue;
          // 乘以倍数
          if (menu[idx].settings[i].min) {
            if (v < menu[idx].settings[i].min) {
              v = menu[idx].settings[i].min
            }
          }
          if (menu[idx].settings[i].max) {
            if (v > menu[idx].settings[i].max) {
              v = menu[idx].settings[i].max
            }
          }
          if (menu[idx].settings[i].times) {
            v = v * menu[idx].settings[i].times
          }
          // 记录设置项目
          setCmd[variable] = v;
          count++;
        }
      }
      if (setCmd == {}) return;

      // 检查蓝牙密码设置
      if (setCmd.blePin && !this.checkBlePin(setCmd.blePin)) return;
      // 传送设置命令
      this.triggerEvent('setcmd', setCmd);
      // 显示 提示 防止连续点击
      if (setCmd.resetDevice != undefined) {
        that.showLoading(this.properties._lang["重启/恢复出厂"], true, 15000, true);
        // 如果是恢复出厂命令 则在15秒后再次读取雷达参数
        setTimeout(function () {
          that.getRadarparam();
        }, 15000)
      } else {
        that.showLoading(this.properties._lang["设置中……"], true, count * 2000);
      }
    },
    // 刷新雷达参数
    cat_BaksetValue(e) {
      let that = this;
      let idx = parseInt(e.target.id);
      let menu = this.data.setMenu;

      for (var i in menu[idx].settings) {
        menu[idx].settings[i].value = menu[idx].settings[i].baseValue;
        menu[idx].settings[i].inputStyle = '';
      }
      that.setData({
        'setMenu': menu,
      });
    },
    // 打开 关闭 选项卡
    displayChange(e) {
      let idx = parseInt(e.target.id);
      let menu = this.data.setMenu;
      //蓝牙未连接 返回
      // if (!that.data.ble_state) return;
      //雷达信息未读取，设置界面无效
      // if (!that.data.radarInfo == null) return;
      menu[idx].display = !menu[idx].display;
      this.setData({
        setMenu: menu
      });
    },

    /*
     * 设置菜单的切换控件控制
     */
    bindPickerChange(e) {
      let that = this;
      let index = e.target.id.split('-');
      let menu = this.data.setMenu;
      menu[index[0]].settings[index[1]].value = e.detail.value;
      if (menu[index[0]].settings[index[1]].baseValue != e.detail.value) {
        menu[index[0]].settings[index[1]].inputStyle = 'input_change';
      } else {
        menu[index[0]].settings[index[1]].inputStyle = '';
      }
      //刷新界面
      that.setData({
        'setMenu': menu,
      });
    },
    /**
     * 输入框判断是否有变化
     */
    bindInputChange(e) {
      let that = this;
      let index = e.target.id.split('-');
      let menu = this.data.setMenu;
      let inputValue = e.detail.value.replace(/[^\w\/\.]/ig, '');
      let pIdx = inputValue.indexOf('.');
      if (pIdx >= 0 && (inputValue.length - pIdx) > 5) {
        inputValue = inputValue.slice(0, pIdx + 5);
      }
      menu[index[0]].settings[index[1]].value = inputValue;
      if (menu[index[0]].settings[index[1]].baseValue != inputValue) {
        menu[index[0]].settings[index[1]].inputStyle = 'input_change';
      } else {
        menu[index[0]].settings[index[1]].inputStyle = '';
      }
      //刷新界面
      that.setData({
        'setMenu': menu,
      });
    },
    // 设置菜单变化
    dis_Menu(radarInfo) {
      let key, value;
      for (let menu of this.data.setMenu) {
        for (let set of menu.settings) {
          key = set.variable;
          value = radarInfo[key];
          if (value != null) {
            if (set.times) {
              set.baseValue = value / set.times;
              set.value = value / set.times;
              set.inputStyle = '';
            } else {
              set.baseValue = value;
              set.value = value;
              set.inputStyle = '';
            }
          }
        }
      }
      this.setData({
        setMenu: this.data.setMenu
      });
    },
    // 检查ble pin
    checkBlePin(pin){
      if(pin && pin.length != 6) return false;
      return true;
    },
    /**
     * loading提示显示
     */
    showLoading(title, mask, duration, readParam = false) {
      wx.showLoading({
        title: title,
        mask: mask,
      });
      // 设置关闭时间
      setTimeout(function () {
        wx.hideLoading()
        if (readParam) {
          this.getRadarparam();
        }
      }, duration);
    },

    genarateActivePassword()
    {
      let date = new Date();

      let year = Number(date.getFullYear());
      // getMonth 返回0-11正整数
      let month = Number(date.getMonth())+1;
      let day = Number(date.getDate());
      let hour = Number(date.getHours());

      let d_buf = new ArrayBuffer(4);

      let year_view = new Uint8Array(d_buf, 0, 1);
      year_view[0] = year;

      let month_view = new Uint8Array(d_buf, 1, 1);
      month_view[0] = month;

      let day_view = new Uint8Array(d_buf, 2, 1);
      day_view[0] = day;

      let hour_view = new Uint8Array(d_buf, 3, 1);
      hour_view[0] = hour;

      let data_view = new Uint8Array(d_buf);
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

      dataview = parseInt(dataview)*11;
      let total = dataview.toString()
      
      if (total.length <= 6)
      {
        for (let i=0; i<6-total.length; i++)
        {
          total += '0';
        }
      }
      else
      {
        total = total.slice(0, 6);
      }

      return total;
    },

    cat_activePassword(e) {
      let key = this.genarateActivePassword();

      if (this.properties.activePassword == key)
      {
        this.setData({
          'activePasswordEnter': true,
        });
      }
      else
      {
        wx.showToast({
          title: this.properties._lang['密码错误'],
          image: '../../images/error.png',
          duration: 1000
        });
      }
    },

    bindActivePasswordInputChange(e) {
      let key = e.detail.value.replace(/[^\d]/g, '');
      if (key.length > 6) key = key.slice(0, 6);
      this.setData({
        'activePassword': key,
      });
    }
  },

})