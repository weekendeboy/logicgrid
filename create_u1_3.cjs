const fs = require('fs');

function createEl(type, subtype, rotation, value, override = {}) {
  const el = {
    type, subtype, rotation, value,
    labels: { "0": "", "1": "", "2": "", "3": "", "4": "" },
    groupId: null, state: 0, isActive: false, isBlown: false, measureVal: 0,
    isPoweredAt: null, timerOutput: false, color: "#fde047", isPowered: false,
    motorDir: 0, rotationAngle: 0, isPhysicallyPushed: false, extension: 0, isLocked: false
  };
  if (override.labels) {
    Object.assign(el.labels, override.labels);
    delete override.labels;
  }
  return Object.assign(el, override);
}

const grid = Array.from({length: 60}, () => Array(60).fill(null));

const W = (s, r, v) => createEl('wire', s, r, v);
const MC = (s, r, v, l, g) => createEl('relay', s, r, v, {labels: {4: l}, groupId: g});
const R_NO = (l) => createEl('relay', 'no', 2, 100, {labels: {4: l}});
const R_NC = (l) => createEl('relay', 'nc', 0, 100, {labels: {4: l}});
const TON = (s, v, l) => createEl('relay', s, 2, v, {labels: {4: l}});
const COIL = (l) => createEl('relay', 'coil', 0, 100, {labels: {4: l}, prevSignal: false});
const BTN = (s, l1, l2, l4) => createEl('btn', s, 2, 100, {labels: {1: l1, 2: l2, 4: l4}});
const FUSE = () => createEl('protection', 'fuse', 1, 100);
const OL = (g) => createEl('protection', 'ol_2p', 0, 100, {labels: {4: 'OL'}, groupId: g});

// Row 0
grid[0][0] = W('l', 0, 100);
grid[0][1] = W('n', 0, 100);

// Row 1
grid[1][0] = createEl('breaker', 'mcb', 0, 0, {groupId: 'brk_1788239792169'});
grid[1][1] = createEl('breaker', 'mcb', 0, 0, {groupId: 'brk_1788239792169'});

// Row 2
grid[2][0] = W('t', 3, 100);
grid[2][1] = W('bridge', 0, 100);
grid[2][2] = FUSE();
for(let i=3; i<=8; i++) grid[2][i] = W('straight', 1, 0);
grid[2][9] = W('t', 0, 100);
grid[2][10] = createEl('switch', 'sel13', 1, 100);
for(let i=11; i<=15; i++) grid[2][i] = W('straight', 1, 0);
grid[2][16] = W('turn', 2, 100);
grid[2][17] = W('turn', 1, 100);
grid[2][18] = W('t', 0, 100);
grid[2][19] = W('t', 0, 100);
grid[2][20] = W('turn', 2, 100);
grid[2][21] = W('turn', 1, 100);
grid[2][22] = W('t', 0, 100);
grid[2][23] = W('turn', 2, 100);
grid[2][24] = W('turn', 1, 100);
grid[2][25] = W('t', 0, 100);
grid[2][26] = W('straight', 1, 100);
grid[2][27] = W('turn', 2, 100);

// Row 3
grid[3][0] = W('straight', 0, 100);
grid[3][1] = W('t', 3, 100);
grid[3][2] = FUSE();
for(let i=3; i<=7; i++) grid[3][i] = W('straight', 1, 0);
grid[3][8] = W('turn', 2, 100);
grid[3][9] = W('straight', 0, 100);
grid[3][10] = W('t', 3, 100);
for(let i=11; i<=14; i++) grid[3][i] = W('t', 0, 100);
grid[3][15] = W('turn', 2, 100);
grid[3][16] = BTN('toggle', '13', '14', 'LS2');
grid[3][17] = W('straight', 0, 100);
grid[3][18] = R_NO('R');
grid[3][19] = TON('ton_nc', 1000, 'T1');
grid[3][20] = TON('ton_no', 1000, 'T1');
grid[3][21] = W('straight', 0, 100);
grid[3][22] = TON('ton_nc', 1000, 'T2');
grid[3][23] = TON('ton_no', 1000, 'T2');
grid[3][24] = W('straight', 0, 100);
grid[3][25] = TON('ton_nc', 1000, 'T3');
grid[3][27] = TON('ton_no', 1000, 'T3');

// Row 4
grid[4][0] = MC('mc_no_2', 0, 100, 'MC1', 'mc_1788323950854');
grid[4][1] = MC('mc_no_2', 0, 100, 'MC1', 'mc_1788323950854');
grid[4][8] = W('straight', 0, 0);
grid[4][9] = BTN('toggle', '13', '14', 'LS1');
grid[4][10] = W('straight', 0, 100);
grid[4][11] = R_NO('MC2');
grid[4][12] = W('straight', 0, 100);
grid[4][13] = R_NO('MC3');
grid[4][14] = W('straight', 0, 100);
grid[4][15] = R_NO('MC4');
grid[4][16] = W('turn', 0, 100);
grid[4][17] = W('t', 1, 100);
grid[4][18] = W('straight', 2, 100);
grid[4][19] = R_NO('R');
grid[4][20] = W('turn', 0, 100);
grid[4][21] = W('t', 1, 100);
grid[4][22] = R_NO('R');
grid[4][23] = W('turn', 0, 100);
grid[4][24] = W('t', 1, 100);
grid[4][25] = R_NO('R');
grid[4][27] = W('straight', 0, 0);

// Row 5
grid[5][0] = OL('ol_1788323961693');
grid[5][1] = OL('ol_1788323961693');
grid[5][8] = W('straight', 0, 0);
grid[5][9] = W('straight', 0, 0);
for(let i=10; i<=15; i++) grid[5][i] = W('straight', 0, 100);
for(let i=17; i<=19; i++) grid[5][i] = W('straight', 2, 100);
for(let i=21; i<=22; i++) grid[5][i] = W('straight', 2, 100);
for(let i=24; i<=25; i++) grid[5][i] = W('straight', 0, 100);
grid[5][27] = W('straight', 0, 0);

// Row 6
grid[6][0] = W('straight', 0, 100);
grid[6][1] = W('t', 3, 100);
grid[6][2] = W('straight', 1, 100);
grid[6][3] = W('t', 0, 100);
grid[6][4] = W('straight', 1, 100);
grid[6][5] = W('t', 0, 100);
grid[6][6] = W('straight', 1, 100);
grid[6][7] = W('turn', 2, 100);
grid[6][8] = W('straight', 0, 0);
grid[6][9] = R_NC('OL');
grid[6][10] = BTN('no', '13', '14', 'PB1');
grid[6][11] = BTN('nc', '11', '12', 'PB2');
grid[6][12] = BTN('no', '13', '14', 'PB2');
grid[6][13] = BTN('nc', '11', '12', 'PB3');
grid[6][14] = BTN('no', '13', '14', 'PB3');
grid[6][15] = W('straight', 0, 100);
for(let i=17; i<=18; i++) grid[6][i] = W('straight', 2, 100);
grid[6][19] = R_NC('MC4');
grid[6][21] = W('straight', 2, 100);
grid[6][22] = R_NC('MC2');
grid[6][24] = W('straight', 0, 100);
grid[6][25] = R_NC('MC3');
grid[6][27] = W('straight', 0, 0);

// Row 7
grid[7][0] = W('t', 3, 100);
grid[7][1] = W('bridge', 0, 100);
grid[7][2] = W('t', 0, 100);
grid[7][3] = W('bridge', 0, 100);
grid[7][4] = W('t', 0, 100);
grid[7][5] = W('bridge', 0, 100);
grid[7][6] = W('turn', 2, 100);
grid[7][7] = W('straight', 2, 100);
for(let i=8; i<=10; i++) grid[7][i] = W('straight', 0, 0);
for(let i=11; i<=15; i++) grid[7][i] = W('straight', 0, 100);
for(let i=17; i<=19; i++) grid[7][i] = W('straight', 2, 100);
for(let i=21; i<=22; i++) grid[7][i] = W('straight', 2, 100);
for(let i=24; i<=25; i++) grid[7][i] = W('straight', 0, 100);
grid[7][27] = W('straight', 0, 0);

// Row 8
for(let i=0; i<=5; i++) grid[8][i] = W('straight', 0, 100);
grid[8][6] = W('straight', 2, 100);
grid[8][7] = W('straight', 2, 100);
for(let i=8; i<=10; i++) grid[8][i] = W('straight', 0, 0);
grid[8][11] = W('straight', 0, 100);
grid[8][12] = W('turn', 0, 100);
grid[8][13] = W('t', 2, 100);
for(let i=14; i<=16; i++) grid[8][i] = W('straight', 1, 0);
for(let i=17; i<=19; i++) grid[8][i] = W('bridge', 0, 100);
grid[8][20] = W('straight', 1, 100);
grid[8][21] = W('bridge', 0, 100);
grid[8][22] = W('cross', 0, 100);
grid[8][23] = W('turn', 2, 100);
for(let i=24; i<=26; i++) grid[8][i] = W('straight', 0, 100);
grid[8][27] = W('straight', 0, 0);

// Row 9
grid[9][0] = W('straight', 0, 100);
grid[9][1] = W('straight', 0, 100);
grid[9][2] = MC('mc_no_2', 0, 100, 'MC2', 'mc_1788323952716');
grid[9][3] = MC('mc_no_2', 0, 100, 'MC2', 'mc_1788323952716');
grid[9][4] = MC('mc_no_2', 0, 100, 'MC3', 'mc_1788323953265');
grid[9][5] = MC('mc_no_2', 0, 100, 'MC3', 'mc_1788323953265');
grid[9][6] = MC('mc_no_2', 0, 100, 'MC4', 'mc_1788323953960');
grid[9][7] = MC('mc_no_2', 0, 100, 'MC4', 'mc_1788323953960');
grid[9][8] = W('straight', 0, 0);
grid[9][9] = W('straight', 0, 0);
for(let i=17; i<=23; i++) grid[9][i] = W('straight', 2, 100);
for(let i=24; i<=26; i++) grid[9][i] = W('straight', 0, 100);
grid[9][27] = W('straight', 0, 0);

// Row 10
grid[10][0] = createEl('motor', '', 0, 100, {rotationAngle: 1186.75});
grid[10][1] = W('straight', 0, 100);
grid[10][2] = createEl('motor', '', 0, 100, {rotationAngle: 78.25});
grid[10][3] = W('straight', 0, 100);
grid[10][4] = createEl('motor', '', 0, 100, {rotationAngle: 50.25});
grid[10][5] = W('straight', 0, 100);
grid[10][6] = createEl('motor', '', 0, 100, {rotationAngle: 45.5});
grid[10][7] = W('straight', 0, 100);
grid[10][8] = W('straight', 0, 0);
grid[10][9] = COIL('MC1');
grid[10][17] = COIL('R');
grid[10][18] = COIL('T1');
grid[10][19] = COIL('MC2');
grid[10][20] = createEl('load', 'lightbulb', 0, 100);
grid[10][21] = COIL('T2');
grid[10][22] = COIL('MC3');
grid[10][23] = createEl('load', 'lightbulb', 0, 100);
grid[10][24] = COIL('T3');
grid[10][25] = COIL('MC4');
grid[10][26] = createEl('load', 'lightbulb', 0, 100, {color: '#ef4444'});
grid[10][27] = createEl('load', 'buzzer', 0, 100);

// Row 11
grid[11][0] = W('turn', 0, 100);
grid[11][1] = W('turn', 3, 100);
grid[11][2] = W('turn', 0, 100);
grid[11][3] = W('turn', 3, 100);
grid[11][4] = W('turn', 0, 100);
grid[11][5] = W('turn', 3, 100);
grid[11][6] = W('turn', 0, 100);
grid[11][7] = W('turn', 3, 100);
grid[11][8] = W('turn', 0, 0);
grid[11][9] = W('t', 2, 100);
for(let i=10; i<=16; i++) grid[11][i] = W('straight', 1, 0);
for(let i=17; i<=26; i++) grid[11][i] = W('t', 2, 100);
grid[11][27] = W('turn', 3, 100);

const data = {
  mode: "wiring",
  width: 60,
  height: 60,
  grid: grid
};

fs.writeFileSync('src/levels/class_c_u1_3.json', JSON.stringify(data));
console.log("Successfully generated src/levels/class_c_u1_3.json");
