const fs = require('fs');

const grid = Array.from({ length: 60 }, () => Array(60).fill(null));

function setTile(y, x, type, subtype, rot = 0, lbl = "", val = 100, ex = {}) {
  grid[y][x] = {
    type, subtype, rotation: rot, value: val,
    labels: { "0": "", "1": ex.l1||"", "2": ex.l2||"", "3": "", "4": lbl },
    groupId: ex.gid || null, state: 0, isActive: false, isBlown: false, measureVal: 0,
    isPoweredAt: null, timerOutput: false, color: ex.color || "#fde047", isPowered: false,
    motorDir: 0, rotationAngle: ex.ra || 0, isPhysicallyPushed: false, extension: 0, isLocked: false,
    prevSignal: ex.prevSignal || false
  };
}

// Row 0
setTile(0, 0, 'wire', 'l');
setTile(0, 1, 'wire', 'n');

// Row 1
setTile(1, 0, 'breaker', 'mcb', 0, "", 0, {gid: 'brk_1788239792169'});
setTile(1, 1, 'breaker', 'mcb', 0, "", 0, {gid: 'brk_1788239792169'});

// Row 2
setTile(2, 0, 'wire', 't', 3);
setTile(2, 1, 'wire', 'bridge');
setTile(2, 2, 'protection', 'fuse', 1);
for(let i=3; i<=8; i++) setTile(2, i, 'wire', 'straight', 1, "", 0);
setTile(2, 9, 'wire', 't', 0);
setTile(2, 10, 'switch', 'sel13', 1);
for(let i=11; i<=15; i++) setTile(2, i, 'wire', 'straight', 1, "", 0);
setTile(2, 16, 'wire', 'turn', 2);
setTile(2, 17, 'wire', 'turn', 1);
setTile(2, 18, 'wire', 't', 0);
setTile(2, 19, 'wire', 't', 0);
setTile(2, 20, 'wire', 'turn', 2);
setTile(2, 21, 'wire', 'turn', 1);
setTile(2, 22, 'wire', 't', 0);
setTile(2, 23, 'wire', 'turn', 2);
setTile(2, 24, 'wire', 'turn', 1);
setTile(2, 25, 'wire', 't', 0);
setTile(2, 26, 'wire', 'straight', 1);
setTile(2, 27, 'wire', 'turn', 2);

// Row 3
setTile(3, 0, 'wire', 'straight');
setTile(3, 1, 'wire', 't', 3);
setTile(3, 2, 'protection', 'fuse', 1);
for(let i=3; i<=7; i++) setTile(3, i, 'wire', 'straight', 1, "", 0);
setTile(3, 8, 'wire', 'turn', 2);
setTile(3, 9, 'wire', 'straight');
setTile(3, 10, 'wire', 't', 3);
for(let i=11; i<=14; i++) setTile(3, i, 'wire', 't', 0);
setTile(3, 15, 'wire', 'turn', 2);
setTile(3, 16, 'btn', 'toggle', 2, "LS2", 100, {l1: "13", l2: "14"});
setTile(3, 17, 'wire', 'straight');
setTile(3, 18, 'relay', 'no', 2, "R");
setTile(3, 19, 'relay', 'ton_nc', 2, "T1", 1000);
setTile(3, 20, 'relay', 'ton_no', 2, "T1", 1000);
setTile(3, 21, 'wire', 'straight');
setTile(3, 22, 'relay', 'ton_nc', 2, "T2", 1000);
setTile(3, 23, 'relay', 'ton_no', 2, "T2", 1000);
setTile(3, 24, 'wire', 'straight');
setTile(3, 25, 'relay', 'ton_nc', 2, "T3", 1000);
setTile(3, 27, 'relay', 'ton_no', 2, "T3", 1000);

// Row 4
setTile(4, 0, 'relay', 'mc_no_2', 0, "MC1", 100, {gid: 'mc_1788323950854'});
setTile(4, 1, 'relay', 'mc_no_2', 0, "MC1", 100, {gid: 'mc_1788323950854'});
setTile(4, 8, 'wire', 'straight', 0, "", 0);
setTile(4, 9, 'btn', 'toggle', 2, "LS1", 100, {l1: "13", l2: "14"});
setTile(4, 10, 'wire', 'straight');
setTile(4, 11, 'relay', 'no', 2, "MC2");
setTile(4, 12, 'wire', 'straight');
setTile(4, 13, 'relay', 'no', 2, "MC3");
setTile(4, 14, 'wire', 'straight');
setTile(4, 15, 'relay', 'no', 2, "MC4");
setTile(4, 16, 'wire', 'turn', 0);
setTile(4, 17, 'wire', 't', 1);
setTile(4, 18, 'wire', 'straight', 2);
setTile(4, 19, 'relay', 'no', 2, "R");
setTile(4, 20, 'wire', 'turn', 0);
setTile(4, 21, 'wire', 't', 1);
setTile(4, 22, 'relay', 'no', 2, "R");
setTile(4, 23, 'wire', 'turn', 0);
setTile(4, 24, 'wire', 't', 1);
setTile(4, 25, 'relay', 'no', 2, "R");
setTile(4, 27, 'wire', 'straight', 0, "", 0);

// Row 5
setTile(5, 0, 'protection', 'ol_2p', 0, "OL", 100, {gid: 'ol_1788323961693'});
setTile(5, 1, 'protection', 'ol_2p', 0, "OL", 100, {gid: 'ol_1788323961693'});
setTile(5, 8, 'wire', 'straight', 0, "", 0);
setTile(5, 9, 'wire', 'straight', 0, "", 0);
for(let i=10; i<=15; i++) setTile(5, i, 'wire', 'straight');
setTile(5, 17, 'wire', 'straight', 2);
setTile(5, 18, 'wire', 'straight', 2);
setTile(5, 19, 'wire', 'straight', 2);
setTile(5, 21, 'wire', 'straight', 2);
setTile(5, 22, 'wire', 'straight', 2);
setTile(5, 24, 'wire', 'straight');
setTile(5, 25, 'wire', 'straight');
setTile(5, 27, 'wire', 'straight', 0, "", 0);

// Row 6
setTile(6, 0, 'wire', 'straight');
setTile(6, 1, 'wire', 't', 3);
setTile(6, 2, 'wire', 'straight', 1);
setTile(6, 3, 'wire', 't', 0);
setTile(6, 4, 'wire', 'straight', 1);
setTile(6, 5, 'wire', 't', 0);
setTile(6, 6, 'wire', 'straight', 1);
setTile(6, 7, 'wire', 'turn', 2);
setTile(6, 8, 'wire', 'straight', 0, "", 0);
setTile(6, 9, 'relay', 'nc', 0, "OL");
setTile(6, 10, 'btn', 'no', 2, "PB1", 100, {l1: "13", l2: "14"});
setTile(6, 11, 'btn', 'nc', 2, "PB2", 100, {l1: "11", l2: "12"});
setTile(6, 12, 'btn', 'no', 2, "PB2", 100, {l1: "13", l2: "14"});
setTile(6, 13, 'btn', 'nc', 2, "PB3", 100, {l1: "11", l2: "12"});
setTile(6, 14, 'btn', 'no', 2, "PB3", 100, {l1: "13", l2: "14"});
setTile(6, 15, 'wire', 'straight');
setTile(6, 17, 'wire', 'straight', 2);
setTile(6, 18, 'wire', 'straight', 2);
setTile(6, 19, 'relay', 'nc', 0, "MC4");
setTile(6, 21, 'wire', 'straight', 2);
setTile(6, 22, 'relay', 'nc', 0, "MC2");
setTile(6, 24, 'wire', 'straight');
setTile(6, 25, 'relay', 'nc', 0, "MC3");
setTile(6, 27, 'wire', 'straight', 0, "", 0);

// Row 7
setTile(7, 0, 'wire', 't', 3);
setTile(7, 1, 'wire', 'bridge');
setTile(7, 2, 'wire', 't', 0);
setTile(7, 3, 'wire', 'bridge');
setTile(7, 4, 'wire', 't', 0);
setTile(7, 5, 'wire', 'bridge');
setTile(7, 6, 'wire', 'turn', 2);
setTile(7, 7, 'wire', 'straight', 2);
for(let i=8; i<=10; i++) setTile(7, i, 'wire', 'straight', 0, "", 0);
for(let i=11; i<=15; i++) setTile(7, i, 'wire', 'straight');
for(let i=17; i<=19; i++) setTile(7, i, 'wire', 'straight', 2);
setTile(7, 21, 'wire', 'straight', 2);
setTile(7, 22, 'wire', 'straight', 2);
setTile(7, 24, 'wire', 'straight');
setTile(7, 25, 'wire', 'straight');
setTile(7, 27, 'wire', 'straight', 0, "", 0);

// Row 8
for(let i=0; i<=5; i++) setTile(8, i, 'wire', 'straight');
setTile(8, 6, 'wire', 'straight', 2);
setTile(8, 7, 'wire', 'straight', 2);
for(let i=8; i<=10; i++) setTile(8, i, 'wire', 'straight', 0, "", 0);
for(let i=11; i<=13; i++) setTile(8, i, 'wire', 'straight');
setTile(8, 14, 'wire', 'turn');
setTile(8, 15, 'wire', 't', 2);
setTile(8, 16, 'wire', 'straight', 1);
setTile(8, 17, 'wire', 'bridge');
setTile(8, 18, 'wire', 'bridge');
setTile(8, 19, 'wire', 'bridge');
setTile(8, 20, 'wire', 'straight', 1);
setTile(8, 21, 'wire', 'bridge');
setTile(8, 22, 'wire', 'bridge');
setTile(8, 23, 'wire', 'straight', 1);
setTile(8, 24, 'wire', 'bridge');
setTile(8, 25, 'wire', 'cross');
setTile(8, 26, 'wire', 'turn', 2);
setTile(8, 27, 'wire', 'straight', 0, "", 0);

// Row 9
for(let i=0; i<=7; i++) setTile(9, i, 'wire', 'straight');
for(let i=8; i<=10; i++) setTile(9, i, 'wire', 'straight', 0, "", 0);
setTile(9, 11, 'wire', 'turn');
setTile(9, 12, 'wire', 't', 2);
for(let i=13; i<=17; i++) setTile(9, i, 'wire', 'straight', 1, "", 0);
setTile(9, 18, 'wire', 'bridge');
setTile(9, 19, 'wire', 'bridge');
setTile(9, 20, 'wire', 'cross');
setTile(9, 21, 'wire', 'turn', 2);
setTile(9, 22, 'wire', 'straight', 2);
setTile(9, 23, 'wire', 'straight', 2);
setTile(9, 24, 'wire', 'straight', 2);
setTile(9, 25, 'wire', 'straight');
setTile(9, 26, 'wire', 'straight');
setTile(9, 27, 'wire', 'straight', 0, "", 0);

// Row 10
setTile(10, 0, 'wire', 'straight');
setTile(10, 1, 'wire', 'straight');
setTile(10, 2, 'relay', 'mc_no_2', 0, "MC2", 100, {gid: 'mc_1788323952716'});
setTile(10, 3, 'relay', 'mc_no_2', 0, "MC2", 100, {gid: 'mc_1788323952716'});
setTile(10, 4, 'relay', 'mc_no_2', 0, "MC3", 100, {gid: 'mc_1788323953265'});
setTile(10, 5, 'relay', 'mc_no_2', 0, "MC3", 100, {gid: 'mc_1788323953265'});
setTile(10, 6, 'relay', 'mc_no_2', 0, "MC4", 100, {gid: 'mc_1788323953960'});
setTile(10, 7, 'relay', 'mc_no_2', 0, "MC4", 100, {gid: 'mc_1788323953960'});
setTile(10, 8, 'wire', 'straight', 0, "", 0);
setTile(10, 9, 'wire', 'straight', 0, "", 0);
for(let i=17; i<=23; i++) setTile(10, i, 'wire', 'straight', 2);
setTile(10, 24, 'wire', 'straight');
setTile(10, 25, 'wire', 'straight');
setTile(10, 26, 'wire', 'straight');
setTile(10, 27, 'wire', 'straight', 0, "", 0);

// Row 11
setTile(11, 0, 'motor', '', 0, "", 100, {ra: 1186.75});
setTile(11, 1, 'wire', 'straight');
setTile(11, 2, 'motor', '', 0, "", 100, {ra: 78.25});
setTile(11, 3, 'wire', 'straight');
setTile(11, 4, 'motor', '', 0, "", 100, {ra: 50.25});
setTile(11, 5, 'wire', 'straight');
setTile(11, 6, 'motor', '', 0, "", 100, {ra: 45.5});
setTile(11, 7, 'wire', 'straight');
setTile(11, 8, 'wire', 'straight', 0, "", 0);
setTile(11, 9, 'relay', 'coil', 0, "MC1");
setTile(11, 17, 'relay', 'coil', 0, "R");
setTile(11, 18, 'relay', 'coil', 0, "T1");
setTile(11, 19, 'relay', 'coil', 0, "MC2");
setTile(11, 20, 'load', 'lightbulb');
setTile(11, 21, 'relay', 'coil', 0, "T2");
setTile(11, 22, 'relay', 'coil', 0, "MC3");
setTile(11, 23, 'load', 'lightbulb');
setTile(11, 24, 'relay', 'coil', 0, "T3");
setTile(11, 25, 'relay', 'coil', 0, "MC4");
setTile(11, 26, 'load', 'lightbulb', 0, "", 100, {color: "#ef4444"});
setTile(11, 27, 'load', 'buzzer');

// Row 12
setTile(12, 0, 'wire', 'turn');
setTile(12, 1, 'wire', 'turn', 3);
setTile(12, 2, 'wire', 'turn');
setTile(12, 3, 'wire', 'turn', 3);
setTile(12, 4, 'wire', 'turn');
setTile(12, 5, 'wire', 'turn', 3);
setTile(12, 6, 'wire', 'turn');
setTile(12, 7, 'wire', 'turn', 3);
setTile(12, 8, 'wire', 'turn', 0, "", 0);
setTile(12, 9, 'wire', 't', 2);
for(let i=10; i<=16; i++) setTile(12, i, 'wire', 'straight', 1, "", 0);
for(let i=17; i<=26; i++) setTile(12, i, 'wire', 't', 2);
setTile(12, 27, 'wire', 'turn', 3);

const finalObj = {
  mode: "wiring",
  width: 60,
  height: 60,
  grid: grid
};

fs.writeFileSync('/app/applet/src/levels/class_c_u1_1.json', JSON.stringify(finalObj));
