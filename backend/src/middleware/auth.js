const jwt=require('jsonwebtoken');
function authenticate(req,res,next){const h=req.headers.authorization||''; const token=h.startsWith('Bearer ')?h.slice(7):null; if(!token)return res.status(401).json({error:'Authentication required'}); try{req.user=jwt.verify(token,process.env.JWT_SECRET); next();}catch(e){return res.status(401).json({error:'Invalid or expired token'});}}
function authorize(...roles){return (req,res,next)=>roles.includes(req.user?.role)?next():res.status(403).json({error:'Insufficient role'});}
module.exports={authenticate,authorize};
