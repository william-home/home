<template>
  <div class="roll">
    <!--盒子 boom执行打开爆炸的效果-->
    <div class="box" :class="{ boom: true }"></div>

    <div class="con">
      <div class="roll_con" :style="moveCss">
        <div class="li" v-for="(item, index) in items" :key="index">
          <div>
            <div class="li_con">
              {{ item.heroname }}
            </div>
            <div class="list_bor" ref="light">
              <img
                :src="require(`./assets/img/bor${item.pz}.png`)"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="list_mask"></div>
    </div>
    <!--中奖皮肤的放大提示框-->
    <div
      class="awardAlert"
      :style="`margin-left:${-53 + leftM}px;${scaleCss}`"
      v-show="awardShow"
    >
      <div class="show_con">
        <div class="light_bor" ref="light_bor"></div>
        <div class="li_con">
          {{ awardItem.heroname }}
        </div>
        <div class="list_bor">
          <img
            :src="require(`./assets/img/bor${awardItem.pz}.png`)"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
    <!--滚动组件开始滑动并且奖励没有弹出时显示 跳过动画的按钮-->
    <div class="btns" v-show="awardRollOpen && !awardShow">
      <a class="stop_btn" @click="openBox()" href="javascript:;"></a>
    </div>
  </div>
</template>

<script>
export default {
  name: "roll",
  data() {
    return {
      awardId: 0, //当前中奖的道具编号
      rollTimer: null, //动画定时器句柄
      leftM: 50, //指针停止位置的偏移量  用来计算弹出框的初始位置

      awardShow: false, //滑动结束后显示奖励放大效果
      awardRollOpen: true, //奖励滚动组件的显示开关
      moveCss: "", //奖励滚动组件的滑动的动画效果css
      scaleCss: "", //奖励弹出放大效果的css
      itemWidth: 113, //每张卡牌的宽度

      luckyNums: 0, //中奖位置
      lnStart: 60, //中奖位置区间开始
      lnEnd: 65, //中奖位置区间结束
      items: [], //滚动的卡片列表
      awardItem: {itemid: 0, pz: 0, heroid: 0, heroname: ''}, //中奖道具
      itemList: [],
    };
  },
  methods: {
    InitPageModel() {
      //随机一个总数
      this.items = [];
      //中奖卡片的位置
      this.luckyNums = this.getRand(this.lnStart, this.lnEnd);
      let loopNum = this.lnEnd - this.luckyNums < 4 ? this.luckyNums + 4 : this.lnEnd;

      for (let i = 0; i < loopNum; i++) {
        let item = {};
        if (i + 1 === this.luckyNums) {
          item = this.itemList.filter((item) => item.itemid === this.awardId)[0]; //把奖励加到列表里
          this.awardItem = item; //拿到奖励的各个参数
        } else {
          item = this.getItem()
        }
        this.items.push(item);
      }
    },
    getRand(start, end) {
      return Math.floor(Math.random() * (end - start + 1) + start);
    },
    //按概率随机获取一个皮肤
    getItem() {
      let r = this.getRand(0, this.itemList.length - 1);

      return this.itemList[r];
    },
    startScroll() {
      let m = this.getRand(0, 100) - 50;
      this.leftM = m;
      this.moveCss = `left:${
        (this.luckyNums - 5) * -this.itemWidth + m
      }px;transition:all 8s cubic-bezier(.1,.59,.1,.9)`;
      //6s 动画结束后 开始弹出奖励图片，6500ms后执行
      this.rollTimer = setTimeout(() => {
        this.awardShow = true;
        //display和动画会有前后执行的冲突，所以加上10ms延时处理
        setTimeout(() => {
          this.scaleCss = `transform:scale(2,2);transition: all 0.5s;margin-left:-53px;`;
          //奖励背景闪光出现效果
          this.$refs.light_bor.style.transition = "all .5s";
          this.$refs.light_bor.style.opacity = 1;
        }, 50);
      }, 8500);
    },
    stopScroll() {
      this.moveCss = `left:${(this.luckyNums - 5) * -this.itemWidth + this.leftM}px;`;
      clearTimeout(this.rollTimer);
      this.awardShow = true;
      setTimeout(() => {
        this.scaleCss = `transform:scale(2,2);transition: all 0.5s;margin-left:-53px;`;
        this.$refs.light_bor.style.transition = "all .5s";
        this.$refs.light_bor.style.opacity = 1;
      }, 50);
    },
    resetBox() {
      this.moveCss = ""; //奖励滚动组件的滑动的动画效果css
      this.scaleCss = ""; //奖励弹出放大效果的css
      this.$refs.light_bor.style.transition = "";
      this.$refs.light_bor.style.opacity = 0;

      this.awardShow = false; //滑动结束后显示奖励放大效果
      this.awardRollOpen = false; //奖励滚动组件的显示开关

      //this.InitPageModel();
    },
    openBox() {
      this.awardId = this.getRand(0, this.itemList.length - 1)
      //初始化数据
      // this.InitPageModel();
      //150ms后显示奖励皮肤滚动组件
      setTimeout(() => {
        //打开滚动组件，同时显示跳过动画的按钮
        this.awardRollOpen = true;
        //500ms 之后开始奖励列表滑动
        this.rollTimer = setTimeout(() => this.startScroll(), 100);
      }, 150);
    },
  },
  beforeCreate() {
    let imgs = [];
    for (let i = 1; i <= 15; i++) {
      imgs.push(require(`./assets/img/box${i}.png`));
    }
    for (let img of imgs) {
      let image = new Image();
      image.src = img;
      image.onload = () => {
      };
    }
  },
  created() {
    try {
      const str = prompt('输入你要抽取的类目,以空格分开');
      this.itemList = str.split(' ').map((heroname, itemid) => ({
        itemid,
        pz: itemid % 5,
        heroname
      }))
      if (this.itemList.length < 2) throw null;
      this.InitPageModel();
    } catch (err) {
      alert('输入错误!至少两样类目')
      history.go(0)
    }


  },
};
</script>

<style scoped>
.roll {
  width: 1017px;
  margin: 0 auto;
  height: 630px;
  background: #2e3841;
  position: relative;
}

.btns {
  padding-top: 5px;
  width: 277px;
  height: 41px;
  position: absolute;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
}

.btns .stop_btn {
  display: block;
  margin: 0 auto;
  width: 120px;
  height: 36px;
  background: url("./assets/img/btn_stop.png") 0 0 no-repeat;
}

.btns .stop_btn:hover {
  background-position: 0 -36px;
}

.btns .stop_btn:active {
  background-position: 0 -72px;
}

.box {
  position: absolute;
  top: 0;
  left: 50%;
  width: 678px;
  height: 630px;
  transform: translateX(-50%);
}

.con {
  padding-top: 228px;
  top: 50%;
  position: relative;
  width: 1017px;
  height: 402px;
  margin: 0 auto;
  overflow-x: hidden;
  transform: translateY(-50%);
}

.con .list_mask {
  position: absolute;
  top: 220px;
  left: 0;
  width: 1017px;
  height: 196px;
  background: url("./assets/img/list_mask.png") 0 0 no-repeat;
}

.roll_con {
  position: absolute;
  width: 10000px;
  height: 148px;
  top: 241px;
  left: 0;
  display: flex;
}

.roll_con .li {
  position: relative;
  width: 107px;
  height: 148px;
  padding: 0 3px;
}

.roll_con .li .showImg {
  z-index: 100;
  padding: 13px 0 0 0;
  width: 133px;
  height: 161px;
  position: fixed;
  animation: showImg 1s forwards;
  top: 50%;
  left: 50%;
  margin: -87px 0 0 -66px;
}

@keyframes showImg {
  from {
    opacity: 0;
    background: none;
    transform: scale(1, 1);
  }
  to {
    opacity: 1;
    background: url("./assets/img/cur_bg.png") 0 0 no-repeat;
    transform: scale(2, 2);
  }
}

.roll_con .li .showImg .list_bor {
  top: 13px;
  left: 13px;
}

.roll_con .li .showImg .li_con {
  width: 107px;
  height: 148px;
  margin: 0 auto;
  position: relative;
}

.roll_con .li .list_bor {
  position: absolute;
  top: 0;
  left: 3px;
  width: 107px;
  height: 148px;
}

.roll_con .li .li_con {
  width: 107px;
  height: 148px;
  line-height: 148px;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.cur {
  position: absolute;
  height: 100px;
  width: 5px;
  top: 50%;
  left: 50%;
  background: #ff0000;
  transform: translate(-50%, -50%);
}

.awardAlert {
  top: 241px;
  position: absolute;
  z-index: 10;
  left: 50%;
  margin-left: -53px;
}

.awardAlert .show_con {
  position: relative;
  width: 107px;
  height: 148px;
}

.awardAlert .show_con .light_bor {
  position: absolute;
  top: -90px;
  left: -108px;
  width: 324px;
  height: 329px;
  opacity: 0;
  background: url("./assets/img/cur_bg.png") 0 0 no-repeat;
  background-size: 100% 100%;
}

.awardAlert.big .show_con .light_bor {
  transition: all 10s;
  opacity: 1;
}

.awardAlert .show_con .list_bor {
  position: absolute;
  top: 0;
  left: 0;
  width: 107px;
  height: 148px;
  z-index: 6;
}

.awardAlert .show_con .li_con {
  width: 107px;
  height: 148px;
  line-height: 148px;
  position: relative;
  z-index: 5;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}
</style>

<style>
body {
  background: #2e3841;
}
</style>
