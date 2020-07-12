<template>
    <div class="detail" >
      <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"></detail-nav-bar>
      <scroll class="content"
              ref="scroll"
              :probe-type="3"
              @scroll="contentScroll">
        <detail-swiper :top-images="topImages"></detail-swiper>
        <detail-base-info :goods="goods"></detail-base-info>
        <detail-shop-info :shop="shop"></detail-shop-info>
        <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"></detail-goods-info>
        <detail-param-info ref="param" :param-info="paramInfo"></detail-param-info>
        <detail-comment-info ref="comment" :comment-info="commentInfo"></detail-comment-info>
        <goods-list ref="recommend" :goods="recommends"></goods-list>
      </scroll>
      <detail-bottom-bar @addCart="addToCart"></detail-bottom-bar>

      <back-top @click.native="backClick" v-show="isShowBackTop"></back-top>
      <!--<toast :message="message" :show="show"></toast>-->
    </div>
</template>

<script>
    import DetailNavBar  from  './childComps/DetailNavBar'
    import DetailSwiper from './childComps/DetailSwiper'
    import DetailBaseInfo from './childComps/DetailBaseInfo'
    import DetailShopInfo from './childComps/DetailShopInfo'
    import DetailGoodsInfo from './childComps/DetailGoodsInfo'
    import DetailParamInfo from './childComps/DetailParamInfo'
    import DetailCommentInfo from './childComps/DetailCommentInfo'
    import DetailBottomBar from './childComps/DetailBottomBar'

    import Scroll from 'components/common/scroll/Scroll';
    import GoodsList from 'components/content/goods/GoodsList'
    // import Toast from 'components/common/toast/Toast'

    import {getDetail,Goods,Shop,GoodsParam,getRecommend} from "network/detail";
    import {debounce} from "common/utils";
    import {itemListenerMixin,backTopMixin} from "common/mixin";

    import {mapActions} from 'vuex'

    export default {
      name: "Detail",
      components:{
        DetailNavBar,
        DetailSwiper,
        DetailBaseInfo,
        DetailShopInfo,
        DetailGoodsInfo,
        DetailParamInfo,
        DetailCommentInfo,
        DetailBottomBar,
        // Toast,

        Scroll,
        GoodsList,
      },
      mixins:[itemListenerMixin,backTopMixin],
      data(){
        return {
          iid:null,
          topImages:[],
          goods:{},
          shop:{},
          detailInfo:{},
          paramInfo:{},
          commentInfo:{},
          recommends:[],
          themeTopYs:[],
          currentIndex:0,
          // message:'',
          // show:false
        }
      },
      created(){
        //1.保存传入的iid
        this.iid = this.$route.params.iid

        //2.根据iid请求详情数据
        getDetail(this.iid).then(res => {
          console.log(res);
          //1.获取顶部的图片轮播数据
          const data = res.result
          this.topImages = data.itemInfo.topImages

          //2.获取商品信息
          this.goods = new Goods(data.itemInfo,data.columns,data.shopInfo.services)

          //3.创建店铺信息变量
          this.shop = new Shop(data.shopInfo)

          //4.保存商品的详情数据
          this.detailInfo = data.detailInfo

          //5.获取参数信息
          this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)

          //6.取出评论的信息
          if(data.rate.cRate !== 0){
            this.commentInfo = data.rate.list[0]
          }

          this.$nextTick(() => {
            //根据最新的数据，对应的DOM是已经被渲染出来
            //但是图片依然是没有加载完(目前获取到offsetTop不包含其中的图片)
            //offsetTop值不对的时候，都是因为图片的问题
            // this.themeTopYs.push(0);
            // this.themeTopYs.push(this.$refs.param.$el.offsetTop)
            // this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
            // this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
            // // console.log(this.themeTopYs);
          })
        })

        //3.请求推荐数据
        getRecommend().then(res => {
          // console.log(res);
          this.recommends = res.data.list
        })
      },
      mounted(){

      },
      destroyed(){
        this.$bus.$off('itemImgLoad',this.itemImgListener)
      },
      methods:{
        ...mapActions(['addCart']),
        imageLoad(){
          this.$refs.scroll.refresh()

          this.themeTopYs = [];
          this.themeTopYs.push(0);
          this.themeTopYs.push(this.$refs.param.$el.offsetTop - 44)
          this.themeTopYs.push(this.$refs.comment.$el.offsetTop - 44)
          this.themeTopYs.push(this.$refs.recommend.$el.offsetTop - 44)
          this.themeTopYs.push(Number.MAX_VALUE)
          console.log(this.themeTopYs);
        },
        titleClick(index){
          this.$refs.scroll.scrollTo(10,-this.themeTopYs[index],200);
        },
        contentScroll(position){
          //1.获取y值
          const positionY = -position.y
          //2.positionY和主题中值进行对比
          let length = this.themeTopYs.length
          for(let i = 0;i < length-1;i++){

            //方法1
            if(this.currentIndex !== i && (positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i + 1])){
              this.currentIndex = i;
              this.$refs.nav.currentIndex = this.currentIndex
            }

            //方法2，更改for i < length
            // if(this.currentIndex !== i && ((i < length - 1 && positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i + 1]) || (i === length - 1 && positionY >= this.themeTopYs[i]))){
            //   this.currentIndex = i;
            //   this.$refs.nav.currentIndex = this.currentIndex
            // }

            //3.是否显示回到顶部
              this.listenShowBackTop(position)
          }
        },
        addToCart(){
          //1.获取购物车需要展示的信息
          const product = {}
          product.image = this.topImages[0]
          product.title = this.goods.title
          product.desc = this.goods.desc
          product.price = this.goods.realPrice
          product.iid = this.iid
          // console.log(product);

          //2.将商品添加到购物车里(1.Promise 2.mapActions)
          // this.$store.commit('addCart',product)
          this.addCart(product).then(res => {
            // this.show=true;
            // this.message = res;
            //
            // setTimeout(() => {
            //   this.show = false
            //   this.message = ''
            // },1500)

            this.$toast.show(res,2000)
          })

          // this.$store.dispatch('addCart',product).then(res => {
          //   console.log(res);
          // })
        }
      }
    }
</script>

<style scoped>
  .detail {
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }

  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #fff;
  }

  .content {
    height: calc(100% - 44px - 49px);
    /*overflow: hidden;*/
  }
</style>
