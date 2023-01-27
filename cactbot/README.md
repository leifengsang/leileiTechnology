# 通用库（都是从souma那边搬的）

* 通用职能位置设置
  * 默认优先级：SAM/MNK/RPR/DRG/NIN/DRK/GNB/WAR/PLD/BRD/MCH/DNC/BLM/RDM/SMN/WHM/AST/SCH/SGE
  * 更改顺序方式：/e rp set SAM/MNK/RPR/DRG/NIN/DRK/GNB/WAR/PLD/BRD/MCH/DNC/BLM/RDM/SMN/WHM/AST/SCH/SGE
* 通用职能位置设置 手动默语宏修正
  * 在不改变优先级的前提下修改职能位置
  * 更改职能位置方式：/e rp manual set 职能位置:玩家全称（如：/e rp manual set D1:Libearated Flame）

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

### P3

* hello world
  * 在每一轮次播报自己要做的事情
    * 初始大圈：去x色放大圈-去x色中间吃分摊-去x色放分摊-去x色中间后面最远距离拉断近线
    * 初始分摊：去x色放分摊-去x色两边吃大圈-去x色放大圈-去x色中间吃分摊
    * 初始DNA（固定近线）：去x色两边吃大圈-去x色放分摊-去x色中间吃分摊-去x色放分摊
    * 初始无buff（固定远线）：去x色两边吃分摊-去x色放分摊-去x色两边吃大圈-去x色放大圈