// component/radar-wave/radar-wave.js
import * as echarts from '../ec-canvas/echarts.min';

var lang = require('../../utils/languageUtils');
//var _lang = lang._lang();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    _lang: {
      type: Object,
      value: lang._lang(),
    },
    // 是否显示
    display: {
      type: Boolean,
      value: true
    },
    // 是否在登陆中
    onlogin: {
      type: Boolean,
      value: false,
    },
    // 量程
    farRange: {
      type: Number,
      value: 0,
    },
    // LCD FFT
    fftWave: {
      type: Array,
      value: [],
      observer: 'renderChartFFT'
    },
    // LCD TVT
    tvtWave: {
      type: Array,
      value: [],
      observer: 'renderChartTVT'
    },
    dampingVal: {
      type: Number,
      value: 0,
      observer: 'disDampingVal'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    radarChart: {
      lazyLoad: true // 延迟加载
    },
    chart : null,
    chartOption: {},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化图表
    init_chart() {
      let that = this;
      this.chartComponent.init((canvas, width, height) => {
        // 初始化图表
        that.data.chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        that.data.chart.setOption(that.data.chartOption);
      });
    },
    // 初始化图表配置信息
    init_chartOption() {
      let serieslist = [];
      let series = {
        name: this.properties._lang['回波曲线'],
        type: 'line',
        data: new Array(128).fill(1),
        showSymbol: false,
        smooth: true,
        lineStyle: {
          color: '#FF3333'
        },
        markLine: {
          'animation': false,
          'silent': false,
          'symbol': 'circle'
        }
      };
      serieslist.push(series);
      series = {
        name: this.properties._lang['阈值曲线'],
        type: 'line',
        data: [],
        showSymbol: false,
        smooth: true,
        lineStyle: {
          color: '#000000'
        }
      };
      serieslist.push(series);

      let option = {
        legend: {
          data: [this.properties._lang['回波曲线'], this.properties._lang['阈值曲线']],
          textStyle: {
            fontSize: 17,
          }
        },
        yAxis: {
          name: 'db',
          type: 'value'
        },
        xAxis: {
          name: this.properties._lang['距离'],
          type: 'value',
          nameLocation: 'center',
          nameGap: 32,
          axisLine: {
            onZero: false
          }
        },
        dataZoom: [{
          type: 'inside',
          xAxisIndex: 0,
        }],

        series: serieslist
      }

      this.data.chartOption = option;
    },
    // 更新图表
    renderChartFFT(fftWave) {
      if (this.data.chartOption.series) {
        this.data.chartOption.series[0].data = fftWave;
        this.data.chart.setOption(this.data.chartOption);
      }
    },
    renderChartTVT(tvtWave) {
      if (this.data.chartOption.series) {
        this.data.chartOption.series[1].data = tvtWave;
        this.data.chart.setOption(this.data.chartOption);
      }
    },
    disDampingVal(dampingVal) {
      if (this.data.chartOption.series) {
        this.data.chartOption.series[0].markLine.data = [{
          'xAxis': dampingVal
        }];
        this.data.chart.setOption(this.data.chartOption);
      }
    },
  },

  ready() {
    this.chartComponent = this.selectComponent('#radar-wave-dom');
    this.init_chartOption();
    // 初始化图表
    this.init_chart();
  },
})