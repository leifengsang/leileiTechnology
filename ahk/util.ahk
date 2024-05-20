CoordMode Pixel, Screen
CoordMode Mouse, Screen

![::
  while GetKeyState("[","T"){
    showMouseColor(false)
    Sleep 20
  }
  ToolTip
  return
  
!]::
  showMouseColor(true)
  return
  
showMouseColor(hide){
  MouseGetPos posX, posY
  PixelGetColor color, %posX%, %posY%, RGB
  ToolTip %posX%`,%posY%`n%color%, %posX% + 10, %posY% + 10
  
  if(hide){
    SetTimer hideTooltip, -5000
  }
  
  return
}

hideTooltip(){
	ToolTip
	return
}