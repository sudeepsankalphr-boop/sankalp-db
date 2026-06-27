import React, { useEffect } from 'react';

export default function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',backgroundColor:'rgba(0,0,0,0.5)'}}>
      <div style={{background:'white',borderRadius:'8px',padding:'24px',width:'100%',maxWidth: wide ? '768px' : '480px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
          <h2 style={{fontSize:'18px',fontWeight:'600',color:'#1f2937'}}>{title}</h2>
          <button onClick={onClose} style={{fontSize:'24px',lineHeight:1,color:'#9ca3af',cursor:'pointer',background:'none',border:'none'}}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
