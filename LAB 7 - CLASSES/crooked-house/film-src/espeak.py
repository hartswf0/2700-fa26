import ctypes as C, espeakng_loader as L, numpy as np
lib=C.CDLL(L.get_library_path())
class EV(C.Structure):
    _fields_=[('type',C.c_int),('uid',C.c_uint),('text_position',C.c_int),('length',C.c_int),('audio_position',C.c_int),('sample',C.c_int),('user_data',C.c_void_p),('id',C.c_char*8)]
CB=C.CFUNCTYPE(C.c_int,C.POINTER(C.c_short),C.c_int,C.POINTER(EV))
SR=lib.espeak_Initialize(1,500,L.get_data_path().encode(),0)
_buf=[];_ev=[]
@CB
def cb(wav,n,ev):
    if wav and n>0:_buf.append(np.ctypeslib.as_array(wav,shape=(n,)).copy())
    i=0
    while True:
        e=ev[i]
        if e.type==0:break
        if e.type==1:_ev.append((e.text_position,e.length,e.audio_position))
        i+=1
    return 0
lib.espeak_SetSynthCallback(cb)
def say(text,voice='en-gb+m3',rate=128,pitch=32,rng=40):
    _buf.clear();_ev.clear()
    lib.espeak_SetVoiceByName(voice.encode())
    lib.espeak_SetParameter(1,rate,0);lib.espeak_SetParameter(3,pitch,0);lib.espeak_SetParameter(4,rng,0)
    b=text.encode('utf-8')
    lib.espeak_Synth(b,len(b)+1,0,1,0,0x0+0x1000,None,None)  # CHARS_AUTO|ENDPAUSE
    lib.espeak_Synchronize()
    a=np.concatenate(_buf) if _buf else np.zeros(1,np.int16)
    return a,SR,list(_ev)
if __name__=='__main__':
    import wave
    a,sr,ev=say("Glimmerquox. Pendulate. Brumm.")
    print(sr,len(a)/sr,ev)
    w=wave.open('/tmp/espeak-test.wav','wb');w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(a.tobytes());w.close()
