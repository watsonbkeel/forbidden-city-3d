export const upperFrontWindow=m=>m.position.y>5.45&&Math.abs(m.position.z+4.9)<.15&&['window-backing','window-mullion','window-frame','step-lattice','window-crossbar'].includes(m.userData.role);
