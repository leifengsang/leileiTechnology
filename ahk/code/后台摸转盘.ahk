#NoEnv  ; Recommended for performance and compatibility with future AutoHotkey releases.
; #Warn  ; Enable warnings to assist with detecting common errors.
SendMode Input  ; Recommended for new scripts due to its superior speed and reliability.
SetWorkingDir %A_ScriptDir%  ; Ensures a consistent starting directory.

CoordMode Pixel, Screen
CoordMode Mouse, Screen
CoordMode ToolTip, Screen

8::
	check()
	return

check(){
	static startFlag:=true
	if(startFlag){
		showTooltip("开始")
		start()
	}else{
		showTooltip("结束")
		end()
	}
	startFlag:=!startFlag
}

start(){
  SetTimer lottery, 100
	return
}
	
end(){
  SetTimer lottery, Off
	return
}

lottery(){
  sendControl("{f}")
  return
}

sendControl(content, win:="《剑灵》"){
  controlsend, , % content, % win
  return
}

showTooltip(text){
	ToolTip %text%, A_ScreenWidth / 2 - 25, A_ScreenHeight * 7 / 10
	SetTimer hideTooltip, -5000
	return
}

hideTooltip(){
	ToolTip
	return
}