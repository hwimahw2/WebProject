Function signData(sDataToSign, pkiType)
    Dim ar
    Dim b64
    ar = strToByteArray(sDataToSign)
    b64 = SignBytes(ar, pkiType)
    signData = b64
End Function

' функция проверки библиотеки сертификатов
Function getCertType()
    On Error Resume Next
    Dim Crypt
    Set Crypt = CreateObject("xPKI.VCERT")
    If Err.Number <> 0 Then
        Err.Clear
        ' Библиотека не найдена, пробуем другую
        Set Crypt = CreateObject("rPKI.VCERT")
        If Err.Number <> 0 Then
            ' Не найдена и вторая библиотека, может быть старая установлена?
            Err.Clear
            Set Crypt = CreateObject("PKI.VCERT")
            If Err.Number <> 0 Then
                MsgBox "Ошибка при доступе к криптографической библиотеке - у Вас либо запрещено использование ActiveX-объектов, не отмеченных как безопасных для использования в скриптах, либо не установлена сама криптографическая библиотека.", 48, "Не удалось определить тип используемого справочника сертификатов!"
                getCertType = "unknown"
                Exit Function
            End If
            ' Найдена старая библиотека
            getCertType = "PKI"
            Exit Function
        End If
        ' Найдена RSA библиотека
        getCertType = "rPKI"
        Exit Function
    End If
    ' пробуем найти вторую
    Set Crypt = CreateObject("rPKI.VCERT")
    If Err.Number <> 0 Then
        ' Не найдена и вторая библиотека, значит есть только первая
        getCertType = "xPKI"
        Exit Function
    End If
    ' найдено обе билбиотеки. надо выбирать
    getCertType = "select"
End Function

Function SignBytes(byteAr, pkiType)
    On Error Resume Next
    Dim Crypt
    Dim SignParam1
    Dim sign_out1
    
    Set Crypt = CreateObject(pkiType + ".VCERT")
    If Err.Number <> 0 Then
        MsgBox "Ошибка при доступе к криптографической библиотеке - у Вас либо запрещено использование ActiveX-объектов, не отмеченных как безопасных для использования в скриптах, либо не установлена сама криптографическая библиотека.", 48, "Поручение не подписано и не отправлено на исполнение!"
        SignBytes = ""
        Exit Function
    End If
    Crypt.Initialize "My", 0
    if Err.Number <> 0 Then
        If Err.Number = -529530871 Then
            MsgBox "Неудачная инициализация криптосессии (отказ от ее инициализации)!" & vbCrLf & "Ошибка при инициализации криптографии. Код: " & Err.Number, 48, "Поручение не подписано и не отправлено на исполнение!"
            SignBytes = ""
            Exit Function
        End If
        Crypt.GetPKIErrorText Err.Number, err_text
        MsgBox "Ошибка при инициализации криптографии. Код: " & Err.Number & vbCrLf & "Описание: " & Err.Description & vbCrLf & err_text, 48, "Поручение не подписано и не отправлено на исполнение!"
        SignBytes = ""
        Exit Function
    End If
    Set SignParam1 = CreateObject(pkiType + ".SignParam")
    if Err.Number <> 0 Then
        MsgBox "Ошибка при создании объекта SignParam. Код: " & Err.Number & vbCrLf & "Описание: " & Err.Description, 48, "Поручение не подписано и не отправлено на исполнение!"
        SignBytes = ""
        Exit Function
    End If
    SignParam1.flag = 1 'Flag_Sign_Pkcs7
    Crypt.SignMem SignParam1, byteAr, Empty, sign_out1
    if Err.Number <> 0 Then
        if Err.Number = 5 Then
            MsgBox "У Вас, по всей видимости, установлена старая версия библиотеки mpkicom.dll. Ее необходимо обновить. Ошибка при попытке подписи данных. Код: " & Err.Number & vbCrLf & "Описание: " & Err.Description, 48, "Поручение не подписано и не отправлено на исполнение!"
            SignBytes = ""
            Exit Function
        End If
        MsgBox "Ошибка при попытке подписи данных. Код: " & Err.Number & vbCrLf & "Описание: " & Err.Description, 48, "Поручение не подписано и не отправлено на исполнение!"
        SignBytes = ""
        Exit Function
    End If
    Crypt.Uninitialize
    if Err.Number <> 0 Then
        MsgBox "Ошибка при попытке деинициализации криптографии. Код: " & Err.Number & vbCrLf & "Описание: " & Err.Description, 48, "Поручение не подписано и не отправлено на исполнение!"
    End If
    SignBytes = Base64Encode(sign_out1)
End Function

Function Base64Encode(inData)
  Const Base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  Dim cOut, sOut, i, sz
  
  'For each group of 3 bytes
  sz = UBound(inData)
  For i = LBound(inData) To sz Step 3
    Dim nGroup, pOut, sGroup
    'Create one long from this 3 bytes.
    nGroup = &H10000 * inData(i) + &H100 * el(inData, i + 1, sz) + el(inData, i + 2, sz)
    
    'Oct splits the long To 8 groups with 3 bits
    nGroup = Oct(nGroup)
    
    'Add leading zeros
    nGroup = String(8 - Len(nGroup), "0") & nGroup
    
    'Convert To base64
    pOut = Mid(Base64, CLng("&o" & Mid(nGroup, 1, 2)) + 1, 1) + _
      Mid(Base64, CLng("&o" & Mid(nGroup, 3, 2)) + 1, 1) + _
      Mid(Base64, CLng("&o" & Mid(nGroup, 5, 2)) + 1, 1) + _
      Mid(Base64, CLng("&o" & Mid(nGroup, 7, 2)) + 1, 1)
    
    'Add the part To Output string
    sOut = sOut + pOut
    
  Next
  Select Case (sz - LBound(inData) + 1) Mod 3
    Case 1: '8 bit final
      sOut = Left(sOut, Len(sOut) - 2) + "=="
    Case 2: '16 bit final
      sOut = Left(sOut, Len(sOut) - 1) + "="
  End Select
  Base64Encode = sOut
End Function

Function el(ar, index, size)
  If index > size Then
    el = 0
  Else
    el = ar(index)
  End If
End Function

Function strToByteArray(str)
    Dim ar()
    Dim ls
    ls = Len(str)
    ReDim ar(ls - 1)
    For i = 1 To ls
        ar(i - 1) = charDecode(Mid(str, i, 1))
    Next
    strToByteArray = ar
End Function

Function charDecode(c)
    Dim r
    If Asc(c) < 128 Then
        r = Asc(c)
    ElseIf c = "Ђ" Then
        r = 128
    ElseIf c = "Ѓ" Then
        r = 129
    ElseIf c = "‚" Then
        r = 130
    ElseIf c = "ѓ" Then
        r = 131
    ElseIf c = "„" Then
        r = 132
    ElseIf c = "…" Then
        r = 133
    ElseIf c = "†" Then
        r = 134
    ElseIf c = "‡" Then
        r = 135
    ElseIf c = "€" Then
        r = 136
    ElseIf c = "‰" Then
        r = 137
    ElseIf c = "Љ" Then
        r = 138
    ElseIf c = "‹" Then
        r = 139
    ElseIf c = "Њ" Then
        r = 140
    ElseIf c = "Ќ" Then
        r = 141
    ElseIf c = "Ћ" Then
        r = 142
    ElseIf c = "Џ" Then
        r = 143
    ElseIf c = "ђ" Then
        r = 144
    ElseIf c = "‘" Then
        r = 145
    ElseIf c = "’" Then
        r = 146
    ElseIf c = "“" Then
        r = 147
    ElseIf c = "”" Then
        r = 148
    ElseIf c = "•" Then
        r = 149
    ElseIf c = "–" Then
        r = 150
    ElseIf c = "—" Then
        r = 151
    ElseIf c = "" Then
        r = 152
    ElseIf c = "™" Then
        r = 153
    ElseIf c = "љ" Then
        r = 154
    ElseIf c = "›" Then
        r = 155
    ElseIf c = "њ" Then
        r = 156
    ElseIf c = "ќ" Then
        r = 157
    ElseIf c = "ћ" Then
        r = 158
    ElseIf c = "џ" Then
        r = 159
    ElseIf c = " " Then
        r = 160
    ElseIf c = "Ў" Then
        r = 161
    ElseIf c = "ў" Then
        r = 162
    ElseIf c = "Ј" Then
        r = 163
    ElseIf c = "¤" Then
        r = 164
    ElseIf c = "Ґ" Then
        r = 165
    ElseIf c = "¦" Then
        r = 166
    ElseIf c = "§" Then
        r = 167
    ElseIf c = "Ё" Then
        r = 168
    ElseIf c = "©" Then
        r = 169
    ElseIf c = "Є" Then
        r = 170
    ElseIf c = "«" Then
        r = 171
    ElseIf c = "¬" Then
        r = 172
    ElseIf c = "­" Then
        r = 173
    ElseIf c = "®" Then
        r = 174
    ElseIf c = "Ї" Then
        r = 175
    ElseIf c = "°" Then
        r = 176
    ElseIf c = "±" Then
        r = 177
    ElseIf c = "І" Then
        r = 178
    ElseIf c = "і" Then
        r = 179
    ElseIf c = "ґ" Then
        r = 180
    ElseIf c = "µ" Then
        r = 181
    ElseIf c = "¶" Then
        r = 182
    ElseIf c = "·" Then
        r = 183
    ElseIf c = "ё" Then
        r = 184
    ElseIf c = "№" Then
        r = 185
    ElseIf c = "є" Then
        r = 186
    ElseIf c = "»" Then
        r = 187
    ElseIf c = "ј" Then
        r = 188
    ElseIf c = "Ѕ" Then
        r = 189
    ElseIf c = "ѕ" Then
        r = 190
    ElseIf c = "ї" Then
        r = 191
    ElseIf c = "А" Then
        r = 192
    ElseIf c = "Б" Then
        r = 193
    ElseIf c = "В" Then
        r = 194
    ElseIf c = "Г" Then
        r = 195
    ElseIf c = "Д" Then
        r = 196
    ElseIf c = "Е" Then
        r = 197
    ElseIf c = "Ж" Then
        r = 198
    ElseIf c = "З" Then
        r = 199
    ElseIf c = "И" Then
        r = 200
    ElseIf c = "Й" Then
        r = 201
    ElseIf c = "К" Then
        r = 202
    ElseIf c = "Л" Then
        r = 203
    ElseIf c = "М" Then
        r = 204
    ElseIf c = "Н" Then
        r = 205
    ElseIf c = "О" Then
        r = 206
    ElseIf c = "П" Then
        r = 207
    ElseIf c = "Р" Then
        r = 208
    ElseIf c = "С" Then
        r = 209
    ElseIf c = "Т" Then
        r = 210
    ElseIf c = "У" Then
        r = 211
    ElseIf c = "Ф" Then
        r = 212
    ElseIf c = "Х" Then
        r = 213
    ElseIf c = "Ц" Then
        r = 214
    ElseIf c = "Ч" Then
        r = 215
    ElseIf c = "Ш" Then
        r = 216
    ElseIf c = "Щ" Then
        r = 217
    ElseIf c = "Ъ" Then
        r = 218
    ElseIf c = "Ы" Then
        r = 219
    ElseIf c = "Ь" Then
        r = 220
    ElseIf c = "Э" Then
        r = 221
    ElseIf c = "Ю" Then
        r = 222
    ElseIf c = "Я" Then
        r = 223
    ElseIf c = "а" Then
        r = 224
    ElseIf c = "б" Then
        r = 225
    ElseIf c = "в" Then
        r = 226
    ElseIf c = "г" Then
        r = 227
    ElseIf c = "д" Then
        r = 228
    ElseIf c = "е" Then
        r = 229
    ElseIf c = "ж" Then
        r = 230
    ElseIf c = "з" Then
        r = 231
    ElseIf c = "и" Then
        r = 232
    ElseIf c = "й" Then
        r = 233
    ElseIf c = "к" Then
        r = 234
    ElseIf c = "л" Then
        r = 235
    ElseIf c = "м" Then
        r = 236
    ElseIf c = "н" Then
        r = 237
    ElseIf c = "о" Then
        r = 238
    ElseIf c = "п" Then
        r = 239
    ElseIf c = "р" Then
        r = 240
    ElseIf c = "с" Then
        r = 241
    ElseIf c = "т" Then
        r = 242
    ElseIf c = "у" Then
        r = 243
    ElseIf c = "ф" Then
        r = 244
    ElseIf c = "х" Then
        r = 245
    ElseIf c = "ц" Then
        r = 246
    ElseIf c = "ч" Then
        r = 247
    ElseIf c = "ш" Then
        r = 248
    ElseIf c = "щ" Then
        r = 249
    ElseIf c = "ъ" Then
        r = 250
    ElseIf c = "ы" Then
        r = 251
    ElseIf c = "ь" Then
        r = 252
    ElseIf c = "э" Then
        r = 253
    ElseIf c = "ю" Then
        r = 254
    ElseIf c = "я" Then
        r = 255
    End If
    charDecode = CByte(r)
End Function