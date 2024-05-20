XButton2::
loop{
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
}Until Not getkeystate("XButton2","P")
return

XButton1::
loop{
 send {f}
sleep 5
send {t}
sleep 5
}Until Not getkeystate("XButton1","P")
return

`::
 send {s}
sleep 1
 send {s}
sleep 1
 send {s}
sleep 1



