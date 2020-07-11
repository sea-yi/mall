import {debounce} from "./utils";

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
  }
}
