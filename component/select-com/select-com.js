// component/select-com/select-com.js

var lang = require('../../utils/languageUtils');


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    _lang: {
      type: Object,
      value: lang._lang(),
    },
    selectItems: {
      type: Array,
      value: [],
    },
    textLabel: {
      type: String,
      value: '',
    },
    textUnit: {
      type: String,
      value: '',
    },
    choiceItem: {
      type: String,
      value: '',
    },
    variable: {
      type: String,
      value: '',
    },
    comId: {
      type: String,
      value: null,
    },
    comId2: {
      type: String,
      value: null,
    },
    buttonLock: {
      type: Boolean,
      value: false,
    },
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    cat_SetValue(e) {
      this.triggerEvent('setcmd', {
        'text': this.properties.choiceItem,
        'id': this.properties.comId,
        'id2': this.properties.comId2,
        'variable': this.properties.variable,
      });
    },

    cat_ReadValue(e) {
      this.triggerEvent('readcmd', {
        'variable': this.properties.variable,
        'id': this.properties.comId,
        'id2': this.properties.comId2,
      });
    },

    bindPickerChange(e) {
      this.setData({
        choiceItem: this.properties.selectItems[e.detail.value],
      });
    }
  }
})
