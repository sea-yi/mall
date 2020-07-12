import {debounce} from "./utils";
import BackTop from 'components/content/backTop/BackTop';


export const itemListenerMixin = {
  data(){
    itemImgListener:null
  },
  mounted(){
    //监听item汇总图片加载完成
    let refresh = debounce(this.$refs.scroll.refresh,100)
    //对监听的事件进行保存
    this.itemImgListener = () => {
      refresh()
    }

    this.$bus.$on('itemImgLosd',this.itemImgListener)
  },
}

export const backTopMixin = {
  components: {
    BackTop
  },
  data() {
    return {
      isShowBackTop: false
    }
  },
  methods: {
    backClick() {
      this.$refs.scroll.scrollTo(0, 0,1000)
    },
    listenShowBackTop(position) {
      this.isShowBackTop = (-position.y) > 1000
    }
  }
}
