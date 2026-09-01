const API_URL=import.meta.env.VITE_API_URL||'';

export async function api(path,options={}){
  const token=localStorage.getItem('token');
  let response;
  try{
    response=await fetch(`${API_URL}${path}`,{
      ...options,
      headers:{
        'Content-Type':'application/json',
        ...(token?{Authorization:`Bearer ${token}`}:{}) ,
        ...(options.headers||{})
      }
    });
  }catch(error){
    throw new Error('Backend server is unavailable. Run the backend on port 5000.');
  }
  const data=await response.json().catch(()=>({}));
  if(response.status===401&&path!=='/api/auth/login'){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('petcare:session-expired'));
    throw new Error('Your session expired. Please sign in again.');
  }
  if(!response.ok)throw new Error(data.error||`Request failed (${response.status})`);
  return data;
}
