# 通用库（都是从souma那边搬的）

* 通用职能位置设置
  * 默认顺序：SAM/MNK/RPR/DRG/NIN/DRK/GNB/WAR/PLD/BRD/MCH/DNC/BLM/RDM/SMN//WHM/AST/SCH/SGE
  * 更改顺序方式：/e rp set SAM/MNK/RPR/DRG/NIN/DRK/GNB/WAR/PLD/BRD/MCH/DNC/BLM/RDM/SMN//WHM/AST/SCH/SGE

# 绝欧米茄

## P1

* 循环编译
  * 踩塔/接线前播报提示
* 全能之主
  * 播报提示出去单吃红点名
  * 播报相同麻将组的玩家职能位置

### P2

* 一运（programPT）
  * 索尼头顶标记（触发器id：leilei TOP p2 一运头顶标记）
    * 默认关闭，需要配置***是否标记***为true
    * 默认索尼顺序：circle/x/square/triangle，可通过配置***ps顺序***更改
    * 默认职能位置优先级：H1/MT/ST/D1/D2/D3/D4/H2，可通过配置***优先级***更改
    * 使用方式：以眼睛为12点，攻击1234去左边从上往下依次排队，锁链123、攻击5去右边从上往下依次排队
  * 击退分摊前，提醒远近线
  * 击退分摊后，自动清除头顶标记（触发器id：leilei TOP p2 一运男人读条）
    * 默认关闭，需要配置***是否标记***为true
* 二运（programLB）
  * 男人投盾后，提醒需要分摊的人前往分摊
* 转场机制（final analysis）（触发器id：leilei TOP p2 final analysis 头顶标记）
  * 视频参考：https://www.bilibili.com/video/BV1jT411y7Xi/
  * 默认关闭，需要配置***是否标记***为true
  * 默认职能位置优先级：H1/MT/ST/D1/D2/D3/D4/H2，可通过配置***优先级***更改
  * 使用方式：见视频
