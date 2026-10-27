# R108：累计人物首显与驻留切换验证

批准范围：实测人物首显、40m边界/地图/飞行视角下机回退，继承正确R95/R96，不为版本号重写人物。基底R107 a8d74ad5（R105已上线）；R107缓存启用必须按main实际入口，不用测试ZoneManager默认off伪验。

1. 首先逐blob证明src/scene/characters、data/characters、FlightState与R105相同；当前main唯一新策略/cache接入另核。无确定缺陷则仅验证/测试记录，运行release仍R105。
2. 真实完整CPU世界、CharacterSystem、108逻辑登记、原1ms准备预算；首显以实际submittedActors+InstancedMesh.count判，不用binding代替。低档冷场景储秀北京12:48，独立进程R105/累计同driver五对30Hz，保600逐帧样本/全部角色首显/工作量/p95/p99/max。15/60Hz为功能帧率补点，不换算实机秒数。构建前后成本另列，禁止把预建后人物cold叫浏览器首载。
3. 真实生产Teleport.go储秀↔承乾↔养心，cache命中/卸载/再注册后逻辑、near4m实际模型/动态body一致；hidden、开关、低高档、昼夜、占位与共享key取消不重写。边界40/45、60/70用实际逻辑sample及距离兴趣latch查，视锥不等于模型驻留。
4. 飞行视角沿用R96已验飞机XZ输入，24m/s/100m、相机偏17m；切回地面下一update只按真实地面70m资格，落点占位仍安全。若只是受控view输入必须标压力切换而非实际起降路线；FlightState/main接口源精确证据另列。
5. GPU/手机/真实Node20未验，不绕WebGL限制；正常可达主游线碰撞归R109，禁止本版顺手改算法。
