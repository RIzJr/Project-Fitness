# Boxing-ring bell, ding-ding-ding: modal synthesis of a struck brass/steel gong bell.
# Inharmonic partials (each a detuned pair, so they shimmer), each with its own decay; a hard clapper strike (filtered noise
# + metallic click + a tiny downward pitch glide); three fast strikes, the last ringing out. 32 kHz, 16-bit mono WAV.
import numpy as np, wave, sys
SR=32000; DUR=3.3; f0=640.0
t=np.arange(int(SR*DUR))/SR
#            ratio  amp   T60(s)
PARTIALS=[(0.50, 0.22, 3.6),(1.00, 1.00, 3.2),(1.19, 0.28, 2.6),(2.04, 0.62, 2.2),(2.76, 0.70, 1.8),(3.73, 0.42, 1.25),
          (5.15, 0.30, 0.85),(6.40, 0.18, 0.6),(8.20, 0.10, 0.38),(10.4, 0.06, 0.25)]
rng=np.random.default_rng(7)
def strike(start, vel):
    x=np.zeros_like(t); m=t>=start; tt=t[m]-start
    glide=1-0.003*np.exp(-tt/0.03)                      # strike pushes pitch up a hair, settles in 30 ms
    for r,a,T in PARTIALS:
        k=np.log(1000)/T                                  # exp decay reaching -60 dB at T
        bright=1+0.6*min(1,(r-1)/6) if r>1 else 1         # harder hits excite high partials a bit more
        for det,ph in ((-0.7,rng.uniform(0,6.28)),(0.7,rng.uniform(0,6.28))):
            f=(f0*r+det)*glide
            ph_t=2*np.pi*np.cumsum(f)/SR+ph
            env=np.exp(-k*tt)*(1-np.exp(-tt/0.0008))
            x[m]+=0.5*a*vel**(bright)*env*np.sin(ph_t)
    # clapper: short bright noise burst and a metallic click
    n=rng.standard_normal(m.sum())*np.exp(-tt/0.004)
    n=np.diff(n,prepend=0)                                 # crude high-pass
    click=sum(np.sin(2*np.pi*fc*tt+rng.uniform(0,6.28)) for fc in (7300,9100,10600))*np.exp(-tt/0.006)
    x[m]+=vel*(0.10*n+0.05*click)
    return x
y=strike(0.0,1.0)+strike(0.31,0.93)+strike(0.62,0.98)
fade=np.ones_like(t); fl=int(0.45*SR); fade[-fl:]=np.linspace(1,0,fl)**2; y*=fade
y=np.tanh(1.6*y/np.max(np.abs(y)))                         # gentle saturation for a denser, louder ring
y=y/np.max(np.abs(y))*10**(-1/20)                           # peak -1 dBFS
pcm=(y*32767).astype(np.int16)
with wave.open(sys.argv[1],"wb") as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
rms=lambda a,b:float(np.sqrt(np.mean(y[int(a*SR):int(b*SR)]**2)))
print("bytes",len(pcm)*2+44,"| rms 0-0.3s %.3f  0.7-1.2s %.3f  2-2.5s %.3f  2.9-3.3s %.3f"%(rms(0,.3),rms(.7,1.2),rms(2,2.5),rms(2.9,3.29)))
