CoordMode Pixel, Screen
CoordMode Mouse, Screen

8::
	check()
	return

check(){
	static startFlag:=true
	if(startFlag){
		showTooltip("开始挂机")
		start()
	}else{
		showTooltip("结束挂机")
		end()
	}
	startFlag:=not startFlag
}

global fightFlag
start(){
	fightFlag:=false
	SetTimer, checkFight, 1000
	return
}
	
end(){
	SetTimer, checkFight, Off
	SetTimer fight, Off
	return
}

checkFight(){
	if(fightFlag){
		return
	}
	
	if(bossExists()){
		showTooltip("开始战斗")
		fightFlag:=true
		SetTimer, fight, 100
	}
}

; 战斗
fight(){
	doLoop()
	if(not bossExists()){
		showTooltip("结束战斗")
		SetTimer fight, Off
		collect()
	}
	return
}

; 拾取
collect(){
	; 防止捡不到卡死
	forwardCount:=0
	maxCount:=10
	while(not collectable() and forwardCount < maxCount){
		send {w down}
		sleep 200
		send {w up}
		sleep 200
		
		forwardCount++
		
		sleep 1000
	}
	
	; 看到可以捡了
	if(forwardCount < maxCount){
		showTooltip("开始拾取")
		send {f}
		sleep 200
		send {f}
		sleep 200
		send {f}
		sleep 200
		send {f}
		sleep 200
		
		; 万一是只猪，把他放下来
		send {4}
	}
	
	send {s down}
	sleep forwardCount * 400
	send {s up}
	
	fightFlag:=false
	return
}

; 我的F改过键位的，建议其他人自己取色F键位的位置
collectable(){
	PixelSearch x1, y1, 1540, 805, 1600, 910, "0x442901", 10, Fast RGB
	return not ErrorLevel
}

; 判断boss是否存在
bossExists(){
	; 血条
	PixelSearch x1, y1, 1050, 110, 1150, 160, "0x852727", 10, Fast RGB
	return not ErrorLevel
}

; 循环
doLoop(){
	send {1}
	sleep 10
	send {z}
	sleep 10
	send {4}
	sleep 10

	send {t}
	sleep 2
	send {x down}
	sleep 2
	send {x up}
	send {r}
	sleep 2
	send {t}
	sleep 1
	send {r}
	sleep 2
	send {t}
	sleep 1
	
	return
}

showTooltip(text){
	ToolTip %text%, 1250, 1100
	SetTimer hideTooltip, -5000
	return
}

hideTooltip(){
	ToolTip
	return
}
