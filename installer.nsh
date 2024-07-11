!include "MUI2.nsh"

!define APP_NAME "vivant-voip"

Section "Register Protocol" SEC01
  ExecWait '"$INSTDIR\register-protocol.reg"'
SectionEnd
