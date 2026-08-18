const code = `
        const isClosed =
          t.subtype === 'no'
            ? t.isActive || t.isPhysicallyPushed
            : t.subtype === 'nc'
            ? !(t.isActive || t.isPhysicallyPushed)
            : false;

        ctx.fillStyle =
          t.type === 'btn'
            ? t.isActive || t.isPhysicallyPushed
              ? '#10b981'
              : '#475569'
            : '#475569';
        ctx.beginPath();
        ctx.arc(0, -16, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 16, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isClosed ? '#10b981' : '#cbd5e1';
        ctx.lineWidth = 4;
        if (t.subtype === 'nc') {
          if (!(t.isActive || t.isPhysicallyPushed)) {
            ctx.beginPath();
            ctx.moveTo(-12, -16);
            ctx.lineTo(-12, 16);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(-18, -12);
            ctx.lineTo(-18, 20);
            ctx.stroke();
          }
        } else {
          if (t.isActive || t.isPhysicallyPushed) {
            ctx.beginPath();
            ctx.moveTo(-12, -16);
            ctx.lineTo(-12, 16);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(-18, -12);
            ctx.lineTo(-18, 20);
            ctx.stroke();
          }
        }
`;
console.log('Test string exists');
