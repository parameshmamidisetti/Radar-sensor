// component/radar-wave/radar-wave.js
import * as echarts from '../ec-canvas/echarts.min';
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
    // LCD TVT Base
    tvtBaseWave: {
      type: Array,
      value: [],
      observer: 'renderChartTVTBase'
    },
    flowValue: {
      type: Number,
      value: 0,
      observer: 'disFlowValue'
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
      // series = {
      //   name: this.properties._lang['阈值基准曲线'],
      //   type: 'line',
      //   data: [],
      //   showSymbol: false,
      //   smooth: true,
      //   lineStyle: {
      //     color: '#000555'
      //   }
      // };
      // serieslist.push(series);

      let option = {
        legend: {
          data: [this.properties._lang['回波曲线'], this.properties._lang['阈值曲线']],
          textStyle: {
            fontSize: 15,
          }
        },
        yAxis: {
          name: 'db',
          type: 'value'
        },
        xAxis: {
          name: this.properties._lang['速度'],
          nameLocation: 'center',
          nameGap: 32,
          type: 'value',
          axisLine: {
            onZero: true
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
    renderChartTVTBase(tvtWaveBase) {
      if (this.data.chartOption.series) {
        this.data.chartOption.series[2].data = tvtWaveBase;
        this.data.chart.setOption(this.data.chartOption);
      }
    },
    disFlowValue(flowValue) {
      if (this.data.chartOption.series) {
        this.data.chartOption.series[0].markLine.data = [{
          'xAxis': flowValue
        }];
        this.data.chart.setOption(this.data.chartOption);
      }
    },
  },

  ready() {
    console.log("雷达图表初始化");
    this.chartComponent = this.selectComponent('#radar-wave-dom');
    this.init_chartOption();
    // 初始化图表
    this.init_chart();
  },
})