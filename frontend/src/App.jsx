import React,{useEffect,useState} from 'react';
import {api} from './api';
import {CrudPage,DataTable,FormFields,PageHeader,StatCard,useGrouped} from './components';

const adminNavigation=[
  {label:'Overview',items:['Dashboard']},
<<<<<<< HEAD
  {label:'Administration',items:['User Accounts','Staff Employment','System Activity']},
=======
  {label:'Administration',items:['User Accounts']},
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
  {label:'People',items:['My Profile','People Directory','Pet Owners','Emergency Contacts']},
  {label:'Pet Operations',items:['Shelter Management','Pet Directory','Rescue Operations','Adoption Monitoring']},
  {label:'Health Care',items:['Health Records','Medicine Inventory','Vaccination Records']},
  {label:'Accounts',items:['Financial Overview','Donation Monitoring','Payroll']},
<<<<<<< HEAD
  {label:'Developer Tools',items:['Insights & Reports','Smart PetCare Tools']}
=======
  {label:'Developer Tools',items:['Insights & Reports','Smart PetCare Tools','Data Model']}
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
];

const roleNavigation={
  ADMIN:adminNavigation,
  SUPERVISOR:[
    {label:'Overview',items:['Dashboard']},
    {label:'Team',items:['My Profile','People Directory','Pet Owners','Emergency Contacts','Team Management']},
<<<<<<< HEAD
    {label:'Pet Operations',items:['Shelter Management','Pet Directory','Rescue Operations','Rescue Intake','Adoption Review']},
=======
    {label:'Pet Operations',items:['Shelter Management','Pet Directory','Rescue Operations','Adoption Review']},
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
    {label:'Staff Accounts',items:['Payroll']}
  ],
  EMPLOYEE:[
    {label:'Overview',items:['Dashboard']},
    {label:'My Account',items:['My Profile','Emergency Contacts']},
<<<<<<< HEAD
    {label:'Pet Operations',items:['Shelter Management','Pet Directory','Pet Owners','My Assigned Adoptions']},
=======
    {label:'Pet Operations',items:['Shelter Management','Pet Directory','Pet Owners','Rescue Operations','My Assigned Adoptions']},
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
    {label:'Health Care',items:['Health Records','Medicine Inventory','Vaccination Records']}
  ],
  DOCTOR:[
    {label:'Overview',items:['Dashboard']},
    {label:'My Profile',items:['My Profile','Emergency Contacts']},
    {label:'Patient Care',items:['Pet Directory','Health Records','Medicine Inventory','Vaccination Records']},
    {label:'Clinical Tools',items:['Smart PetCare Tools']}
  ],
  ADOPTER:[
    {label:'Overview',items:['Dashboard']},
    {label:'My Profile',items:['My Profile','Emergency Contacts']},
    {label:'Adoption',items:['Pet Directory','My Adoption Applications']}
  ],
  VOLUNTEER:[
    {label:'Overview',items:['Dashboard']},
    {label:'My Account',items:['My Profile','Emergency Contacts']},
<<<<<<< HEAD
    {label:'Rescue Work',items:['My Rescue Reports']}
=======
    {label:'Rescue Work',items:['My Assigned Rescues']}
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
  ],
  DONOR:[
    {label:'Overview',items:['Dashboard']},
    {label:'My Account',items:['My Profile','Emergency Contacts']},
    {label:'Giving',items:['My Donations']}
<<<<<<< HEAD
  ],
  OWNER:[
    {label:'Overview',items:['Dashboard']},
    {label:'My Account',items:['My Profile','Emergency Contacts']},
    {label:'Pet Ownership',items:['My Registered Pets']}
=======
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
  ]
};

const demoAccounts=[
  {label:'Administrator',username:'admin'},
  {label:'Supervisor',username:'supervisor'},
  {label:'Employee',username:'employee'},
  {label:'Doctor',username:'doctor'},
<<<<<<< HEAD
  {label:'Volunteer',username:'volunteer'},
=======
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
  {label:'Adopter',username:'adopter'}
];

class PageErrorBoundary extends React.Component{
  constructor(props){super(props);this.state={failed:false};}
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error){console.error('Page render failed',error);}
  render(){
    if(this.state.failed)return <div className="card feature-card"><h3>Page could not be displayed</h3><p>Please refresh the page. If the problem continues, check that the backend is running.</p><button className="btn btn-brand" onClick={()=>window.location.reload()}>Reload Page</button></div>;
    return this.props.children;
  }
}

function Login({onLogin}){
  const [form,setForm]=useState({username:'admin',password:'password'});
  const [registering,setRegistering]=useState(false);
  const [registration,setRegistration]=useState({role:'ADOPTER',gender:'MALE'});
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const submit=async event=>{
    event.preventDefault();setError('');setBusy(true);
    try{const data=await api('/api/auth/login',{method:'POST',body:JSON.stringify(form)});localStorage.setItem('token',data.token);localStorage.setItem('user',JSON.stringify(data.user));onLogin(data.user);}catch(e){setError(e.message);}finally{setBusy(false);}
  };
  const register=async event=>{
    event.preventDefault();setError('');setMessage('');
    if(registration.password!==registration.confirmPassword)return setError('Passwords do not match');
    setBusy(true);
    try{
      const data=await api('/api/auth/register',{method:'POST',body:JSON.stringify(registration)});
      setMessage(data.message);setForm({username:registration.username,password:registration.password});setRegistering(false);
    }catch(e){setError(e.message);}finally{setBusy(false);}
  };
  return <div className="login-screen"><div className={`login-panel shadow-lg ${registering?'registration-panel':''}`}>
    <div className="brand-mark">PC</div><h1>PetCare</h1><p className="text-muted">Pet Adoption Management System</p>
    {!registering?<><form onSubmit={submit}>
      <label className="form-label">Username</label><input className="form-control mb-3" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/>
      <label className="form-label">Password</label><input className="form-control mb-3" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
      {message&&<div className="alert alert-success small">{message}</div>}
      {error&&<div className="alert alert-danger small">{error}</div>}
      <button className="btn btn-brand w-100" disabled={busy}>{busy?'Signing in…':'Sign in'}</button>
    </form>
    <button type="button" className="btn btn-link w-100 mt-2" onClick={()=>{setRegistering(true);setError('');setMessage('');}}>Create Adopter or Donor Account</button>
<<<<<<< HEAD
    <div className="demo-accounts"><span>Quick demo login</span><div>{demoAccounts.map(account=><button type="button" key={account.username} onClick={()=>setForm({username:account.username,password:'password'})}>{account.label}</button>)}</div></div>
=======
    <div className="demo-accounts"><span>Quick demo login</span><div>{demoAccounts.map(account=><button type="button" key={account.username} onClick={()=>setForm({username:account.username,password:'password'})}>{account.label}</button>)}</div><small>All demo accounts use password: <strong>password</strong></small></div>
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
    </>:<><div className="registration-heading"><h2>Create Account</h2><p>Adopters and donors can register themselves.</p></div>
    <form onSubmit={register}>
      <FormFields form={registration} setForm={setRegistration} fields={[
        {name:'role',label:'Register As',type:'select',options:['ADOPTER','DONOR'],required:true},
        {name:'firstName',label:'First Name',required:true},{name:'lastName',label:'Last Name',required:true},
        {name:'dateOfBirth',label:'Date of Birth',type:'date'},{name:'gender',label:'Gender',type:'select',options:['MALE','FEMALE','OTHER']},
        {name:'email',label:'Email',type:'email',required:true},{name:'phone',label:'Phone',required:true},{name:'occupation',label:'Occupation'},
        {name:'houseNo',label:'House No'},{name:'street',label:'Street'},{name:'city',label:'City'},
        {name:'username',label:'Username',required:true},{name:'password',label:'Password',type:'password',required:true},{name:'confirmPassword',label:'Confirm Password',type:'password',required:true}
      ]}/>
      {error&&<div className="alert alert-danger small mt-3">{error}</div>}
      <div className="d-flex gap-2 mt-3"><button className="btn btn-brand" disabled={busy}>{busy?'Creating…':'Create Account'}</button><button type="button" className="btn btn-outline-secondary" onClick={()=>{setRegistering(false);setError('');}}>Back to Sign In</button></div>
    </form></>}
  </div></div>;
}

<<<<<<< HEAD
function Layout({user,page,setPage,onLogout,onSwitchRole,children}){
  const [open,setOpen]=useState(false);
  const navGroups=[...(roleNavigation[user.role]||roleNavigation.ADOPTER),{label:'Role Access',items:['Role Applications']}];
=======
function Layout({user,page,setPage,onLogout,children}){
  const [open,setOpen]=useState(false);
  const navGroups=roleNavigation[user.role]||roleNavigation.ADOPTER;
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
  return <div className="app-shell">
    <aside className={`sidebar ${open?'open':''}`}>
      <div className="sidebar-brand"><div className="brand-mark small">PC</div><div><strong>PetCare</strong><span>Management System</span></div></div>
      <nav>{navGroups.map(group=><div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item=><button key={item} className={page===item?'active':''} onClick={()=>{setPage(item);setOpen(false)}}>{item}</button>)}</div>)}</nav>
    </aside>
    <div className="content-shell">
<<<<<<< HEAD
      <header className="topbar"><button className="menu-button" onClick={()=>setOpen(!open)}>☰</button><div><strong>{page}</strong><span>Pet Adoption Management</span></div><div className="user-box"><span>{user.username}</span>{(user.roles||[user.role]).length>1?<select className="form-select form-select-sm role-switcher" value={user.role} onChange={e=>onSwitchRole(e.target.value)}>{(user.roles||[user.role]).map(role=><option key={role} value={role}>{role}</option>)}</select>:<small>{user.role}</small>}<button className="btn btn-sm btn-outline-danger" onClick={onLogout}>Logout</button></div></header>
=======
      <header className="topbar"><button className="menu-button" onClick={()=>setOpen(!open)}>☰</button><div><strong>{page}</strong><span>Pet Adoption Management</span></div><div className="user-box"><span>{user.username}</span><small>{user.role}</small><button className="btn btn-sm btn-outline-danger" onClick={onLogout}>Logout</button></div></header>
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
      <main>{children}</main>
    </div>
  </div>;
}

function Dashboard({user}){
  const [data,setData]=useState(null);const [profile,setProfile]=useState(null);const [error,setError]=useState('');
  useEffect(()=>{Promise.all([api('/api/dashboard'),api('/api/profile')]).then(([stats,profileData])=>{setData(stats);setProfile(profileData);}).catch(e=>setError(e.message));},[]);
  const dashboards={
<<<<<<< HEAD
    ADMIN:{title:'Administrator Dashboard',description:'A complete overview of PetCare operations and accounts.',cards:[['People','PERSON_COUNT'],['Pets','PET_COUNT','green'],['Available Pets','AVAILABLE_LOCAL_PETS','orange'],['Pending Adoptions','PENDING_APPLICATIONS','purple'],['Rescues','RESCUE_COUNT']]},
    SUPERVISOR:{title:'Supervisor Dashboard',description:'Manage the care team and review pending adoption applications.',cards:[['People','PERSON_COUNT'],['Pets','PET_COUNT','green'],['Available Pets','AVAILABLE_LOCAL_PETS','orange'],['Pending Reviews','PENDING_REVIEW_COUNT','purple'],['Rescues','RESCUE_COUNT']]},
    EMPLOYEE:{title:'Employee Dashboard',description:'Handle daily operations and finalize the adoptions assigned to you.',cards:[['My Assigned Adoptions','MY_ASSIGNED_ADOPTION_COUNT','purple'],['Adopted Through Me','MY_ADOPTED_ADOPTION_COUNT','green'],['Pets','PET_COUNT'],['Rescues','RESCUE_COUNT']]},
    DOCTOR:{title:'Doctor Dashboard',description:'Manage pet health records, medicines and vaccinations.',cards:[['Pets','PET_COUNT','green'],['Medical Records','MEDICAL_RECORD_COUNT'],['Medicines','MEDICINE_COUNT','orange'],['Vaccinations','VACCINATION_COUNT','purple']]},
    ADOPTER:{title:'Adopter Dashboard',description:'Browse available pets and follow your adoption applications.',cards:[['Available Pets','AVAILABLE_LOCAL_PETS','orange'],['My Applications','MY_ADOPTION_COUNT','purple']]},
    VOLUNTEER:{title:'Volunteer Dashboard',description:'Report rescues you perform and review your own rescue history.',cards:[['My Rescues','MY_RESCUE_COUNT','purple'],['All Rescues','RESCUE_COUNT'],['Pets','PET_COUNT','green']]},
    DONOR:{title:'Donor Dashboard',description:'Support PetCare and review your donation history.',cards:[['My Donations','MY_DONATION_COUNT','purple'],['Total Donated','MY_DONATION_TOTAL','green'],['Pets Supported','PET_COUNT','orange']]}
    ,OWNER:{title:'Pet Owner Dashboard',description:'Review the guest pets registered in your name.',cards:[['Registered Pets','MY_OWNED_PET_COUNT','purple'],['All Pets','PET_COUNT','green']]}
=======
    ADMIN:{title:'Administrator Dashboard',description:'A complete overview of PetCare operations and accounts.',cards:[['People','PERSON_COUNT'],['Pets','PET_COUNT','green'],['Available Pets','AVAILABLE_LOCAL_PETS','orange'],['Pending Adoptions','PENDING_APPLICATIONS','purple'],['Rescues','RESCUE_COUNT'],['Total Income','TOTAL_INCOME','green'],['Total Expenses','TOTAL_EXPENSES','orange']]},
    SUPERVISOR:{title:'Supervisor Dashboard',description:'Manage the care team and review pending adoption applications.',cards:[['People','PERSON_COUNT'],['Pets','PET_COUNT','green'],['Available Pets','AVAILABLE_LOCAL_PETS','orange'],['Pending Reviews','PENDING_REVIEW_COUNT','purple'],['Rescues','RESCUE_COUNT']]},
    EMPLOYEE:{title:'Employee Dashboard',description:'Handle daily operations and complete the adoptions assigned to you.',cards:[['My Assigned Adoptions','MY_ASSIGNED_ADOPTION_COUNT','purple'],['Completed by Me','MY_COMPLETED_ADOPTION_COUNT','green'],['Pets','PET_COUNT'],['Rescues','RESCUE_COUNT']]},
    DOCTOR:{title:'Doctor Dashboard',description:'Manage pet health records, medicines and vaccinations.',cards:[['Pets','PET_COUNT','green'],['Medical Records','MEDICAL_RECORD_COUNT'],['Medicines','MEDICINE_COUNT','orange'],['Vaccinations','VACCINATION_COUNT','purple']]},
    ADOPTER:{title:'Adopter Dashboard',description:'Browse available pets and follow your adoption applications.',cards:[['Available Pets','AVAILABLE_LOCAL_PETS','orange'],['My Applications','MY_ADOPTION_COUNT','purple']]},
    VOLUNTEER:{title:'Volunteer Dashboard',description:'Review the rescue operations assigned to you.',cards:[['My Assigned Rescues','MY_ASSIGNED_RESCUE_COUNT','purple'],['All Rescues','RESCUE_COUNT'],['Pets','PET_COUNT','green']]},
    DONOR:{title:'Donor Dashboard',description:'Support PetCare and review your donation history.',cards:[['My Donations','MY_DONATION_COUNT','purple'],['Total Donated','MY_DONATION_TOTAL','green'],['Pets Supported','PET_COUNT','orange']]}
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
  };
  const view=dashboards[user.role]||dashboards.ADOPTER;
  const personal=profile?.personal||{};const work=profile?.work||{};
  const designation=work.POSITION||work.SPECIALIZATION||personal.USER_ROLE;
  return <><PageHeader title={view.title} description={view.description}/>{error&&<div className="alert alert-danger">{error}</div>}<div className="dashboard-profile"><div className="profile-avatar">{(personal.FIRST_NAME?.[0]||user.username?.[0]||'U').toUpperCase()}</div><div><span>Welcome back</span><strong>{personal.FULL_NAME||user.username}</strong><small>{designation}{personal.EMAIL?` • ${personal.EMAIL}`:''}</small></div><div className="profile-identity"><span>{personal.PERSON_ID||user.personId}</span><strong>{user.role}</strong></div></div><div className="section-heading"><h2>System Overview</h2><p>Current totals across PetCare operations—not your personal records.</p></div><div className="row g-3">
    {view.cards.map(([label,key,tone])=><StatCard key={key} label={label} value={data?.[key]} tone={tone}/>) }
  </div></>;
}

function ProfileValue({label,value}){return <div className="profile-value"><span>{label}</span><strong>{value===null||value===undefined||value===''?'—':String(value)}</strong></div>;}

function MyProfile(){
  const [profile,setProfile]=useState(null);const [error,setError]=useState('');
  const [passwordForm,setPasswordForm]=useState({});const [passwordMessage,setPasswordMessage]=useState('');const [passwordError,setPasswordError]=useState('');
  useEffect(()=>{api('/api/profile').then(setProfile).catch(e=>setError(e.message));},[]);
  const changePassword=async event=>{
    event.preventDefault();setPasswordMessage('');setPasswordError('');
    if(passwordForm.newPassword!==passwordForm.confirmPassword)return setPasswordError('New passwords do not match');
    try{const response=await api('/api/auth/change-password',{method:'PUT',body:JSON.stringify(passwordForm)});setPasswordMessage(response.message);setPasswordForm({});}catch(e){setPasswordError(e.message);}
  };
  if(error)return <><PageHeader title="My Profile" description="Your personal and work information."/><div className="alert alert-danger">{error}</div></>;
  if(!profile)return <div className="loading">Loading your profile…</div>;
  const {personal:p,phones,addresses,emergencyContacts,work}=profile;
  const workItems=[
    ['Account Role',p.USER_ROLE],['Person Roles',p.PERSON_ROLES],['Position',work.POSITION],['Occupation',work.EMPLOYEE_OCCUPATION||work.ADOPTER_OCCUPATION||work.OWNER_OCCUPATION||work.DONOR_OCCUPATION],
    ['Hire Date',work.HIRE_DATE],['Specialization',work.SPECIALIZATION],['Skill',work.SKILL],['Salary',work.EMPLOYEE_SALARY??work.DOCTOR_SALARY]
  ].filter(([,value])=>value!==null&&value!==undefined&&value!=='');
  return <><PageHeader title="My Profile" description="Review the personal, contact and work information connected to your account."/>
    <div className="profile-hero"><div className="profile-avatar large">{p.FIRST_NAME?.[0]?.toUpperCase()}</div><div><span>{p.PERSON_ID}</span><h2>{p.FULL_NAME}</h2><p>{p.USER_ROLE} account • {p.USER_STATUS}</p></div></div>
    <div className="row g-4"><div className="col-xl-7"><div className="card profile-card"><h3>Personal Information</h3><div className="profile-grid"><ProfileValue label="Full Name" value={p.FULL_NAME}/><ProfileValue label="Date of Birth" value={p.DATE_OF_BIRTH}/><ProfileValue label="Age" value={p.AGE}/><ProfileValue label="Gender" value={p.GENDER}/><ProfileValue label="Email" value={p.EMAIL}/><ProfileValue label="Username" value={p.USERNAME}/></div></div></div>
    <div className="col-xl-5"><div className="card profile-card"><h3>Contact Information</h3><div className="profile-list"><div><span>Phone Number</span>{phones.length?phones.map(row=><strong key={row.PHONE}>{row.PHONE}</strong>):<strong>—</strong>}</div><div><span>Address</span>{addresses.length?addresses.map((row,index)=><strong key={index}>{[row.HOUSE_NO,row.STREET,row.CITY].filter(Boolean).join(', ')}</strong>):<strong>—</strong>}</div></div></div></div>
    <div className="col-xl-7"><div className="card profile-card"><h3>Work Information</h3><div className="profile-grid">{workItems.map(([label,value])=><ProfileValue key={label} label={label} value={value}/>)}</div></div></div>
    <div className="col-xl-5"><div className="card profile-card"><h3>Emergency Contacts</h3><div className="profile-list">{emergencyContacts.length?emergencyContacts.map(row=><div key={row.E_NAME}><span>{row.RELATION}</span><strong>{row.E_NAME}</strong><small>{row.PHONE}</small></div>):<div><strong>No emergency contact added</strong><small>Use the Emergency Contacts page to add one.</small></div>}</div></div></div>
    <div className="col-12"><form className="card profile-card" onSubmit={changePassword}><h3>Change Password</h3><FormFields form={passwordForm} setForm={setPasswordForm} fields={[
      {name:'currentPassword',label:'Current Password',type:'password',required:true},{name:'newPassword',label:'New Password',type:'password',required:true},{name:'confirmPassword',label:'Confirm New Password',type:'password',required:true}
    ]}/>{passwordMessage&&<div className="alert alert-success mt-3 mb-0">{passwordMessage}</div>}{passwordError&&<div className="alert alert-danger mt-3 mb-0">{passwordError}</div>}<button className="btn btn-brand mt-3">Change Password</button></form></div></div>
  </>;
}

const peopleFields=[
<<<<<<< HEAD
  {name:'role',label:'Staff Role',type:'select',options:['DOCTOR','EMPLOYEE','VOLUNTEER'],required:true},
  {name:'firstName',label:'First Name',required:true},{name:'lastName',label:'Last Name',required:true},
  {name:'dateOfBirth',label:'Date of Birth',type:'date'},{name:'gender',label:'Gender',type:'select',options:['MALE','FEMALE','OTHER']},{name:'email',label:'Email',type:'email'},
  {name:'phone',label:'Phone'},{name:'houseNo',label:'House No'},{name:'street',label:'Street'},{name:'city',label:'City'},
  {name:'details',label:'Specialization',showWhen:f=>f.role==='DOCTOR'},
  {name:'details',label:'Position',showWhen:f=>f.role==='EMPLOYEE'},
  {name:'occupation',label:'Occupation',showWhen:f=>f.role==='EMPLOYEE'},
  {name:'hireDate',label:'Hire Date',type:'date',showWhen:f=>f.role==='EMPLOYEE'},
  {name:'details',label:'Skill',showWhen:f=>f.role==='VOLUNTEER'},
  {name:'salary',label:'Salary',type:'number',showWhen:f=>['DOCTOR','EMPLOYEE'].includes(f.role)},
  {name:'username',label:'Login Username',required:f=>!f._editing||f._needsAccount,showWhen:f=>!f._editing||f._needsAccount},
  {name:'password',label:'Temporary Password',type:'password',required:f=>!f._editing||f._needsAccount,showWhen:f=>!f._editing||f._needsAccount}
];

function People({user}){const isAdmin=user.role==='ADMIN';return <CrudPage readOnly={isAdmin} canEdit={isAdmin} title="People Directory" description={isAdmin?'Correct existing person details, invalid dates and missing staff-role/account information. New operational staff are created by Supervisors.':'Create Doctor, Employee or Volunteer profiles and login accounts. Existing person records can only be corrected by an Administrator.'} endpoint="/api/people" columns={['PERSON_ID','FIRST_NAME','LAST_NAME','EMAIL','AGE','ROLES']} searchConfig={{label:'Exact Person ID, Name or Email',placeholder:'Example: P012, Imran Hossain, Hossain, or full email'}} initial={{role:'DOCTOR',gender:'MALE'}} fields={peopleFields} mapPayload={f=>({...f,phones:f.phone?[f.phone]:[],addresses:f.houseNo&&f.street&&f.city?[{houseNo:f.houseNo,street:f.street,city:f.city}]:[]})} editConfig={{key:'PERSON_ID',toForm:row=>{const operationalRole=String(row.ROLES||'').split(',').find(role=>['DOCTOR','EMPLOYEE','VOLUNTEER'].includes(role))||'EMPLOYEE';const dob=row.DATE_OF_BIRTH?String(row.DATE_OF_BIRTH).slice(0,10):'';return {_editing:true,_needsAccount:!row.ROLES,personId:row.PERSON_ID,firstName:row.FIRST_NAME,lastName:row.LAST_NAME,dateOfBirth:dob,gender:row.GENDER||'MALE',email:row.EMAIL||'',role:operationalRole};}}}/>;}
=======
  {name:'personId',label:'Person ID',required:true},{name:'firstName',label:'First Name',required:true},{name:'lastName',label:'Last Name',required:true},
  {name:'dateOfBirth',label:'Date of Birth',type:'date'},{name:'gender',label:'Gender',type:'select',options:['MALE','FEMALE','OTHER']},{name:'email',label:'Email',type:'email'},
  {name:'phone',label:'Phone'},{name:'houseNo',label:'House No'},{name:'street',label:'Street'},{name:'city',label:'City'}
];

function People({user}){return <CrudPage readOnly={user.role==='ADMIN'} title="People Directory" description={user.role==='ADMIN'?'Monitor registered people and their roles.':'Create the basic profile of a Doctor, Employee or Volunteer before assigning their team role and login.'} endpoint="/api/people" columns={['PERSON_ID','FIRST_NAME','LAST_NAME','EMAIL','AGE','ROLES']} fields={peopleFields} mapPayload={f=>({...f,phones:f.phone?[f.phone]:[],addresses:f.houseNo&&f.street&&f.city?[{houseNo:f.houseNo,street:f.street,city:f.city}]:[]})}/>;}
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0

function Emergency({user}){
  const [rows,setRows]=useState([]);const [form,setForm]=useState({});const [editingName,setEditingName]=useState('');
  const [message,setMessage]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  const canReviewStaff=['ADMIN','SUPERVISOR'].includes(user.role);
  const load=async()=>{setLoading(true);setError('');try{setRows(await api('/api/emergency'));}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const reset=()=>{setForm({});setEditingName('');};
  const submit=async event=>{event.preventDefault();setMessage('');setError('');try{
    const path=editingName?`/api/emergency/${encodeURIComponent(editingName)}`:'/api/emergency';
    const response=await api(path,{method:editingName?'PUT':'POST',body:JSON.stringify(form)});
    setMessage(response.message);reset();await load();
  }catch(e){setError(e.message);}};
  const edit=row=>{setForm({eName:row.E_NAME,relation:row.RELATION,phone:row.PHONE});setEditingName(row.E_NAME);setMessage('');setError('');window.scrollTo({top:0,behavior:'smooth'});};
  const remove=async row=>{if(!window.confirm(`Remove ${row.E_NAME} from your emergency contacts?`))return;setMessage('');setError('');try{const response=await api(`/api/emergency/${encodeURIComponent(row.E_NAME)}`,{method:'DELETE'});setMessage(response.message);if(editingName===row.E_NAME)reset();await load();}catch(e){setError(e.message);}};
  return <><PageHeader title="Emergency Contacts" description={canReviewStaff?'Review staff emergency contacts. You can add, edit or remove only your own contact information.':'Add, edit or remove your own emergency contact information.'}/>
    <div className="ownership-note mb-4"><strong>Your profile:</strong><span>{user.personId}</span><small>The owner is selected automatically from the signed-in account.</small></div>
    <form className="card form-card mb-4" onSubmit={submit}><h3>{editingName?'Update my contact':'Add my emergency contact'}</h3><FormFields form={form} setForm={setForm} fields={[
      {name:'eName',label:'Contact Name',required:true},{name:'relation',label:'Relation',required:true},{name:'phone',label:'Phone',required:true}
    ]}/><div className="mt-3 d-flex gap-2"><button className="btn btn-brand" type="submit">{editingName?'Update Contact':'Add Contact'}</button>{editingName&&<button className="btn btn-outline-secondary" type="button" onClick={reset}>Cancel</button>}</div></form>
    {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}
    {loading?<div className="loading">Loading contacts…</div>:<div className="card data-card"><div className="card-header"><strong>{canReviewStaff?'Staff Emergency Contacts':'My Emergency Contacts'}</strong></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Person ID</th><th>Person Name</th><th>Contact Name</th><th>Relation</th><th>Phone</th><th>Action</th></tr></thead><tbody>{rows.length?rows.map(row=><tr key={`${row.PERSON_ID}-${row.E_NAME}`}><td>{row.PERSON_ID}</td><td>{row.PERSON_NAME}</td><td>{row.E_NAME}</td><td>{row.RELATION}</td><td>{row.PHONE}</td><td>{Number(row.CAN_MANAGE)===1?<div className="d-flex gap-2"><button className="btn btn-sm btn-outline-primary" onClick={()=>edit(row)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={()=>remove(row)}>Remove</button></div>:<span className="view-only">View only</span>}</td></tr>):<tr><td colSpan="6" className="empty">No emergency contacts available</td></tr>}</tbody></table></div></div>}
  </>;
}

function UserAccounts(){
  const [rows,setRows]=useState([]);const [form,setForm]=useState({gender:'MALE'});const [message,setMessage]=useState('');const [error,setError]=useState('');
  const load=async()=>{try{setRows(await api('/api/users'));}catch(e){setError(e.message);}};
  useEffect(()=>{load();},[]);
  const submit=async event=>{event.preventDefault();setMessage('');setError('');try{const response=await api('/api/users',{method:'POST',body:JSON.stringify(form)});setMessage(response.message);setForm({gender:'MALE'});await load();}catch(e){setError(e.message);}};
  const changeStatus=async row=>{const status=row.USER_STATUS==='ACTIVE'?'INACTIVE':'ACTIVE';setMessage('');setError('');try{const response=await api(`/api/users/${row.USER_ID}/status`,{method:'PUT',body:JSON.stringify({status})});setMessage(response.message);await load();}catch(e){setError(e.message);}};
  return <><PageHeader title="Supervisor Accounts" description="Create and control Supervisor access. Operational staff accounts are created by a Supervisor."/><form className="card form-card mb-4" onSubmit={submit}><FormFields form={form} setForm={setForm} fields={[
    {name:'firstName',label:'First Name',required:true},{name:'lastName',label:'Last Name',required:true},{name:'dateOfBirth',label:'Date of Birth',type:'date'},
    {name:'gender',label:'Gender',type:'select',options:['MALE','FEMALE','OTHER']},{name:'email',label:'Email',type:'email',required:true},{name:'phone',label:'Phone',required:true},
    {name:'houseNo',label:'House No'},{name:'street',label:'Street'},{name:'city',label:'City'},
    {name:'username',label:'Username',required:true},{name:'password',label:'Temporary Password',type:'password',required:true}
  ]}/><button className="btn btn-brand mt-3">Create Supervisor</button></form>{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<div className="card data-card"><div className="card-header"><strong>Supervisor Access</strong></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>User ID</th><th>Person</th><th>Username</th><th>Role</th><th>Status</th><th>Access</th></tr></thead><tbody>{rows.map(row=><tr key={row.USER_ID}><td>{row.USER_ID}</td><td>{row.FULL_NAME}<small className="d-block text-muted">{row.PERSON_ID}</small></td><td>{row.USERNAME}</td><td>{row.USER_ROLE}</td><td><span className={`status-pill ${row.USER_STATUS.toLowerCase()}`}>{row.USER_STATUS}</span></td><td><button className={`btn btn-sm ${row.USER_STATUS==='ACTIVE'?'btn-outline-danger':'btn-outline-success'}`} onClick={()=>changeStatus(row)}>{row.USER_STATUS==='ACTIVE'?'Deactivate':'Activate'}</button></td></tr>)}</tbody></table></div></div></>;
}

<<<<<<< HEAD
function StaffEmployment(){
  const [rows,setRows]=useState([]);const [message,setMessage]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true);setError('');try{setRows(await api('/api/admin/employees'));}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const layoff=async row=>{
    if(!window.confirm(`Lay off ${row.FULL_NAME}? Employee access and future assignment eligibility will be removed.`))return;
    setMessage('');setError('');
    try{const response=await api(`/api/admin/employees/${row.PERSON_ID}/layoff`,{method:'PUT'});setMessage(response.message);await load();}catch(e){setError(e.message);}
  };
  return <><PageHeader title="Staff Employment" description="Administrators can remove an Employee from active service. Historical adoption and payroll records remain intact."/>
    <div className="monitor-note mb-3">Lay Off disables the Employee role and login access when no other approved role remains. The person will disappear from assignment dropdowns and active staff lists.</div>
    {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}
    {loading?<div className="loading">Loading active employees…</div>:<div className="card data-card"><div className="card-header"><strong>Active Employees</strong></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Person ID</th><th>Employee Name</th><th>Username</th><th>Occupation</th><th>Position</th><th>Action</th></tr></thead><tbody>{rows.length?rows.map(row=><tr key={row.PERSON_ID}><td>{row.PERSON_ID}</td><td>{row.FULL_NAME}</td><td>{row.USERNAME}</td><td>{row.OCCUPATION||'—'}</td><td>{row.POSITION||'—'}</td><td><button className="btn btn-sm btn-outline-danger" onClick={()=>layoff(row)}>Lay Off</button></td></tr>):<tr><td colSpan="6" className="empty">No active employees</td></tr>}</tbody></table></div></div>}
  </>;
}

function Roles(){
  const [rows,setRows]=useState([]);const [message,setMessage]=useState('');const [error,setError]=useState('');
  const teamRoles=['DOCTOR','EMPLOYEE','VOLUNTEER'];
  const load=async()=>{try{const data=await api('/api/roles');setRows(data.filter(row=>teamRoles.includes(row.ROLE_NAME)));}catch(e){setError(e.message);}};
  useEffect(()=>{load();},[]);
  const remove=async row=>{if(!window.confirm(`Remove ${row.ROLE_NAME} role from ${row.FULL_NAME}? Other roles and historical records will remain.`))return;setMessage('');setError('');try{const response=await api(`/api/roles/${row.ROLE_NAME}/${row.PERSON_ID}`,{method:'DELETE'});setMessage(response.message);await load();}catch(e){setError(e.message);}};
  return <><PageHeader title="Team Management" description="Review current Doctor, Employee and Volunteer assignments or remove an operational role."/><div className="monitor-note mb-4">Create new staff in People Directory. Existing users request additional roles from Role Applications, where the correct authority approves or rejects them.</div>{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<div className="card data-card"><div className="card-header"><strong>Doctors, Employees & Volunteers</strong></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Role</th><th>Person ID</th><th>Name</th><th>Details</th><th>Action</th></tr></thead><tbody>{rows.map(row=><tr key={`${row.ROLE_NAME}-${row.PERSON_ID}`}><td>{row.ROLE_NAME}</td><td>{row.PERSON_ID}</td><td>{row.FULL_NAME}</td><td>{row.DETAILS||'—'}</td><td><button className="btn btn-sm btn-outline-danger" onClick={()=>remove(row)}>Remove Role</button></td></tr>)}</tbody></table></div></div></>;
}

function ShelterSupervisorAssignment({shelters,load}){
  const [supervisors,setSupervisors]=useState([]);const [form,setForm]=useState({shelterId:'',supervisorId:''});const [message,setMessage]=useState('');const [error,setError]=useState('');
  useEffect(()=>{api('/api/shelters/supervisors').then(rows=>{setSupervisors(rows);setForm(current=>({...current,supervisorId:current.supervisorId||rows[0]?.PERSON_ID||''}));}).catch(e=>setError(e.message));},[]);
  useEffect(()=>{const unassigned=shelters.find(row=>!row.SUPERVISOR_NAME);setForm(current=>({...current,shelterId:current.shelterId||unassigned?.SHELTER_ID||shelters[0]?.SHELTER_ID||''}));},[shelters]);
  const submit=async event=>{event.preventDefault();setMessage('');setError('');try{const response=await api(`/api/shelters/${form.shelterId}/supervisor`,{method:'PUT',body:JSON.stringify({supervisorId:form.supervisorId})});setMessage(response.message);await load();}catch(e){setError(e.message);}};
  return <form className="card form-card mb-4" onSubmit={submit}><h3>Assign Shelter Supervisor</h3><p className="form-note">Choose who is responsible for a shelter. Pets in that shelter will show this Supervisor in Pet Directory.</p><div className="row g-3"><div className="col-md-6"><label className="form-label">Shelter <span className="required">*</span></label><select className="form-select" required value={form.shelterId} onChange={e=>setForm({...form,shelterId:e.target.value})}>{shelters.map(row=><option key={row.SHELTER_ID} value={row.SHELTER_ID}>{row.SHELTER_ID} — {row.ROOM_TYPE} — {row.SUPERVISOR_NAME||'Unassigned'}</option>)}</select></div><div className="col-md-6"><label className="form-label">Responsible Supervisor <span className="required">*</span></label><select className="form-select" required value={form.supervisorId} onChange={e=>setForm({...form,supervisorId:e.target.value})}>{supervisors.map(row=><option key={row.PERSON_ID} value={row.PERSON_ID}>{row.FULL_NAME} — {row.PERSON_ID}</option>)}</select></div></div><button className="btn btn-brand mt-3" disabled={!form.shelterId||!form.supervisorId}>Assign Supervisor</button>{message&&<div className="alert alert-success mt-3 mb-0">{message}</div>}{error&&<div className="alert alert-danger mt-3 mb-0">{error}</div>}</form>;
}

function Shelters({user}){const canManage=user.role==='ADMIN';return <CrudPage readOnly={!canManage} title={canManage?'Shelter Responsibility Management':'Shelter Operations'} description={canManage?'As the higher authority, create shelters and assign one responsible Supervisor to each shelter.':user.role==='SUPERVISOR'?'Review shelter responsibilities assigned by the Administrator. You cannot assign yourself to a shelter.':'Review shelter spaces, pets, rescues and the responsible Supervisor.'} endpoint="/api/shelters" columns={['SHELTER_ID','ROOM_TYPE','PET_COUNT','RESCUE_COUNT','SUPERVISOR_NAME']} fields={[
  {name:'shelterId',label:'Shelter ID',required:true},{name:'roomType',label:'Room Type',required:true}
]} extra={canManage?({rows,load})=><ShelterSupervisorAssignment shelters={rows} load={load}/>:null}/>;}

function Pets({user}){const canCreate=['ADMIN','EMPLOYEE'].includes(user.role);return <CrudPage readOnly={!canCreate} title="Pet Directory" description={canCreate?'Register pets and see whether each pet is under an Owner, Shelter Supervisor, assigned Employee or Adopter.':'Browse pets, their adoption status and the person currently responsible for them.'} endpoint="/api/pets" columns={['PET_ID','NAME','SPECIES','BREED','GENDER','AGE','WEIGHT','PET_TYPE','ADOPTION_STATUS','RESPONSIBILITY_TYPE','RESPONSIBLE_NAME','RESPONSIBLE_ID','SHELTER_ID','SOURCE_RESCUE_ID']} searchConfig={{label:'Exact Pet ID, Name, Species, Breed or Responsible Person',placeholder:'Example: LP002, Bruno, Dog, Labrador, or Rahim Uddin'}} initial={{petType:'LOCAL',adoptionStatus:'AVAILABLE',ownerIsNew:'YES'}} fields={[
  {name:'name',label:'Name',required:true},{name:'species',label:'Species',required:true},{name:'breed',label:'Breed'},{name:'dob',label:'Date of Birth',type:'date'},{name:'weight',label:'Weight',type:'number'},{name:'shelterId',label:'Assigned Shelter ID',required:true},
=======
function Roles(){
  const [rows,setRows]=useState([]);const [form,setForm]=useState({role:'DOCTOR'});const [message,setMessage]=useState('');const [error,setError]=useState('');
  const teamRoles=['DOCTOR','EMPLOYEE','VOLUNTEER'];
  const load=async()=>{try{const data=await api('/api/roles');setRows(data.filter(row=>teamRoles.includes(row.ROLE_NAME)));}catch(e){setError(e.message);}};
  useEffect(()=>{load();},[]);
  const submit=async event=>{event.preventDefault();setMessage('');setError('');try{const response=await api('/api/roles',{method:'POST',body:JSON.stringify(form)});setMessage(response.message);setForm({role:'DOCTOR'});await load();}catch(e){setError(e.message);}};
  const remove=async row=>{if(!window.confirm(`Remove ${row.FULL_NAME} from the ${row.ROLE_NAME.toLowerCase()} role?`))return;setMessage('');setError('');try{const response=await api(`/api/roles/${row.ROLE_NAME}/${row.PERSON_ID}`,{method:'DELETE'});setMessage(response.message);await load();}catch(e){setError(e.message);}};
  return <><PageHeader title="Team Management" description="Assign or remove Doctor, Employee and Volunteer responsibilities."/><form className="card form-card mb-4" onSubmit={submit}><FormFields form={form} setForm={setForm} fields={[
    {name:'role',label:'Team Role',type:'select',options:teamRoles,required:true},{name:'personId',label:'Person ID',required:true},{name:'details',label:'Specialization / Skill / Position'},{name:'occupation',label:'Occupation'},{name:'hireDate',label:'Hire Date',type:'date'},{name:'amount',label:'Salary',type:'number'},
    {name:'userId',label:'User ID',required:true},{name:'username',label:'Username',required:true},{name:'password',label:'Temporary Password',type:'password',required:true}
  ]}/><small className="form-note">Create the person's basic profile in People Directory first. Assigning the role will also create the login account.</small><button className="btn btn-brand mt-3">Assign Role & Create Login</button></form>{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<div className="card data-card"><div className="card-header"><strong>Doctors, Employees & Volunteers</strong></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Role</th><th>Person ID</th><th>Name</th><th>Details</th><th>Salary</th><th>Action</th></tr></thead><tbody>{rows.map(row=><tr key={`${row.ROLE_NAME}-${row.PERSON_ID}`}><td>{row.ROLE_NAME}</td><td>{row.PERSON_ID}</td><td>{row.FULL_NAME}</td><td>{row.DETAILS||'—'}</td><td>{row.AMOUNT??'—'}</td><td><button className="btn btn-sm btn-outline-danger" onClick={()=>remove(row)}>Remove</button></td></tr>)}</tbody></table></div></div></>;
}

function Shelters({user}){return <CrudPage readOnly={user.role==='ADMIN'} title="Shelter Management" description={user.role==='ADMIN'?'Monitor shelter spaces, pets, rescues and supervisors.':'Manage shelter spaces and review their pets, rescues and supervisors.'} endpoint="/api/shelters" columns={['SHELTER_ID','ROOM_TYPE','PET_COUNT','RESCUE_COUNT','SUPERVISOR_NAME']} fields={[
  {name:'shelterId',label:'Shelter ID',required:true},{name:'roomType',label:'Room Type',required:true}
]}/>;}

function Pets({user}){const readOnly=user.role!=='EMPLOYEE';return <CrudPage readOnly={readOnly} title="Pet Directory" description={readOnly?'Browse registered pets and track their current adoption status.':'Register local pets or complete a guest-pet intake with its owner information.'} endpoint="/api/pets" columns={['PET_ID','NAME','SPECIES','BREED','AGE','WEIGHT','PET_TYPE','ADOPTION_STATUS']} initial={{petType:'LOCAL',adoptionStatus:'AVAILABLE',ownerIsNew:'YES'}} fields={[
  {name:'petId',label:'Pet ID',required:true},{name:'name',label:'Name',required:true},{name:'species',label:'Species',required:true},{name:'breed',label:'Breed'},{name:'dob',label:'Date of Birth',type:'date'},{name:'weight',label:'Weight',type:'number'},
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
  {name:'petType',label:'Pet Type',type:'select',options:['LOCAL','GUEST'],required:true},{name:'adoptionStatus',label:'Adoption Status',type:'select',options:['AVAILABLE','PENDING','ADOPTED','ON_HOLD'],showWhen:f=>f.petType==='LOCAL'},{name:'intakeDate',label:'Intake Date',type:'date',showWhen:f=>f.petType==='LOCAL'},{name:'checkInDate',label:'Guest Check-in Date',type:'date',showWhen:f=>f.petType==='GUEST'},{name:'relevantTime',label:'Guest Stay / Relevant Time',showWhen:f=>f.petType==='GUEST'},
  {name:'ownerIsNew',label:'Guest Owner Is New',type:'select',options:['YES','NO'],showWhen:f=>f.petType==='GUEST'},{name:'ownerId',label:'Owner Person ID',required:true,showWhen:f=>f.petType==='GUEST'},{name:'ownerFirstName',label:'Owner First Name',required:true,showWhen:f=>f.petType==='GUEST'&&f.ownerIsNew==='YES'},{name:'ownerLastName',label:'Owner Last Name',required:true,showWhen:f=>f.petType==='GUEST'&&f.ownerIsNew==='YES'},{name:'ownerGender',label:'Owner Gender',type:'select',options:['MALE','FEMALE','OTHER'],showWhen:f=>f.petType==='GUEST'&&f.ownerIsNew==='YES'},{name:'ownerEmail',label:'Owner Email',type:'email',showWhen:f=>f.petType==='GUEST'&&f.ownerIsNew==='YES'},{name:'ownerPhone',label:'Owner Phone',required:true,showWhen:f=>f.petType==='GUEST'&&f.ownerIsNew==='YES'},{name:'ownerOccupation',label:'Owner Occupation',showWhen:f=>f.petType==='GUEST'&&f.ownerIsNew==='YES'},{name:'ownerHouseNo',label:'Owner House No',showWhen:f=>f.petType==='GUEST'&&f.ownerIsNew==='YES'},{name:'ownerStreet',label:'Owner Street',showWhen:f=>f.petType==='GUEST'&&f.ownerIsNew==='YES'},{name:'ownerCity',label:'Owner City',showWhen:f=>f.petType==='GUEST'&&f.ownerIsNew==='YES'}
]}/>;}

function PetOwners({user}){
<<<<<<< HEAD
  const [rows,setRows]=useState([]);const [search,setSearch]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(true);const [emptyMessage,setEmptyMessage]=useState('No records available');
  const load=async value=>{setLoading(true);setError('');try{const data=await api(`/api/owners${value?`?search=${encodeURIComponent(value)}`:''}`);setRows(Array.isArray(data)?data:data.rows||[]);setEmptyMessage(Array.isArray(data)?'No records available':data.message||'No records available');}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load('');},[]);
  return <><PageHeader title="Pet Owners" description={user.role==='EMPLOYEE'?'Find an owner and every guest pet registered in their name. New owners are created during guest-pet intake.':'Search owners and review every guest pet registered in their name.'}/>
    <form className="card form-card mb-4" onSubmit={event=>{event.preventDefault();load(search.trim());}}><div className="row g-3 align-items-end"><div className="col-md-9"><label className="form-label">Exact Owner ID, Name or Phone</label><input className="form-control" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Example: P012, Imran Hossain, Hossain, or full phone number"/></div><div className="col-md-3"><button className="btn btn-brand w-100">Search</button></div></div></form>
    {error&&<div className="alert alert-danger">{error}</div>}{loading?<div className="loading">Loading pet owners…</div>:<DataTable rows={rows} columns={['OWNER_ID','OWNER_NAME','PHONE','OCCUPATION','PET_ID','PET_NAME','SPECIES','BREED','CHECK_IN_DATE','RELEVANT_TIME']} emptyMessage={emptyMessage}/>}</>;
}

function MyOwnedPets(){
  const [rows,setRows]=useState([]);const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  useEffect(()=>{api('/api/my-owned-pets').then(setRows).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
  return <><PageHeader title="My Registered Pets" description="Guest pets whose ownership has been verified and registered in your name."/>{error&&<div className="alert alert-danger">{error}</div>}{loading?<div className="loading">Loading your pets…</div>:<DataTable rows={rows} columns={['PET_ID','PET_NAME','SPECIES','BREED','CHECK_IN_DATE','RELEVANT_TIME']}/>}</>;
}

function RoleApplications(){
  const [data,setData]=useState({mine:[],reviewQueue:[],activeRoles:[]});
  const [form,setForm]=useState({requestedRole:'DONOR'});const [message,setMessage]=useState('');const [error,setError]=useState('');
  const load=async()=>{try{const result=await api('/api/role-applications');setData(result);window.dispatchEvent(new CustomEvent('petcare:roles-updated',{detail:result.activeRoles}));}catch(e){setError(e.message);}};
  useEffect(()=>{load();},[]);
  const submit=async event=>{event.preventDefault();setMessage('');setError('');try{const response=await api('/api/role-applications',{method:'POST',body:JSON.stringify(form)});setMessage(response.message);setForm({requestedRole:'DONOR'});await load();}catch(e){setError(e.message);}};
  const review=async(row,decision)=>{setMessage('');setError('');try{const response=await api(`/api/role-applications/${row.ROLE_APPLICATION_ID}/review`,{method:'PUT',body:JSON.stringify({decision})});setMessage(response.message);await load();}catch(e){setError(e.message);}};
  const role=form.requestedRole;
  return <><PageHeader title="Role Applications" description="Apply for an additional compatible role. Approval authority changes according to the requested role."/>
    <div className="monitor-note mb-3">Supervisor → Admin approval · Doctor/Employee/Volunteer/Adopter/Donor → Supervisor approval</div>
    <form className="card form-card mb-4" onSubmit={submit}><h3>Apply for another role</h3><FormFields form={form} setForm={setForm} fields={[
      {name:'requestedRole',label:'Requested Role',type:'select',options:['DONOR','ADOPTER','VOLUNTEER','DOCTOR','EMPLOYEE','SUPERVISOR'],required:true},
      {name:'occupation',label:'Occupation',showWhen:f=>['DONOR','ADOPTER','EMPLOYEE'].includes(f.requestedRole)},
      {name:'details',label:role==='DOCTOR'?'Specialization':role==='EMPLOYEE'?'Position':'Skill',showWhen:f=>['DOCTOR','EMPLOYEE','VOLUNTEER'].includes(f.requestedRole)},
      {name:'hireDate',label:'Hire Date',type:'date',showWhen:f=>f.requestedRole==='EMPLOYEE'},
      {name:'salary',label:'Salary',type:'number',showWhen:f=>['DOCTOR','EMPLOYEE'].includes(f.requestedRole)}
    ]}/><button className="btn btn-brand mt-3">Submit Role Application</button></form>
    {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}
    <DataTable title="My Applications" rows={data.mine} columns={['ROLE_APPLICATION_ID','REQUESTED_ROLE','REQUESTED_AT','STATUS','REVIEWER_ROLE','REVIEWED_AT','REVIEW_NOTE']}/>
    {data.reviewQueue.length>0&&<div className="card data-card mt-4"><div className="card-header"><strong>Applications awaiting my review</strong></div><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Applicant</th><th>Requested Role</th><th>Requested</th><th>Action</th></tr></thead><tbody>{data.reviewQueue.map(row=><tr key={row.ROLE_APPLICATION_ID}><td>{row.APPLICANT_NAME}<small className="d-block text-muted">{row.PERSON_ID}</small></td><td>{row.REQUESTED_ROLE}</td><td>{row.REQUESTED_AT}</td><td><div className="d-flex gap-2"><button className="btn btn-sm btn-success" onClick={()=>review(row,'APPROVED')}>Approve</button><button className="btn btn-sm btn-outline-danger" onClick={()=>review(row,'REJECTED')}>Reject</button></div></td></tr>)}</tbody></table></div></div>}
  </>;
}

const rescueColumns=['RESCUE_ID','RESCUE_DATE','LOCATION','SHELTER_ID','SHELTER_ROOM_TYPE','SUPERVISOR_NAME','INTAKE_STATUS','PET_IDS','PET_NAMES','INTAKE_DATE'];
function rescueRowsForDisplay(rows){
  return rows.map(row=>({
    ...row,
    PET_IDS:row.PET_IDS||(row.INTAKE_STATUS==='INTAKE_COMPLETED'?'No pets recorded':'Waiting for shelter intake'),
    PET_NAMES:row.PET_NAMES||(row.INTAKE_STATUS==='INTAKE_COMPLETED'?'No pets recorded':'Waiting for shelter intake')
  }));
}

function Rescues({user}){
  const isVolunteer=user.role==='VOLUNTEER';
  const initialRescueForm={gender:'UNKNOWN',adoptionStatus:'ON_HOLD',intakeDate:new Date().toISOString().slice(0,10)};
  const [rows,setRows]=useState([]);const [shelters,setShelters]=useState([]);const [form,setForm]=useState(initialRescueForm);const [message,setMessage]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true);setError('');try{setRows(await api('/api/rescues'));}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();if(isVolunteer)api('/api/rescues/shelters').then(data=>{setShelters(data);setForm(current=>({...current,shelterId:current.shelterId||data[0]?.SHELTER_ID||''}));}).catch(e=>setError(e.message));},[]);
  const submit=async event=>{event.preventDefault();setMessage('');setError('');try{const response=await api('/api/rescues',{method:'POST',body:JSON.stringify(form)});setMessage(response.message);setForm(current=>({...initialRescueForm,shelterId:current.shelterId||shelters[0]?.SHELTER_ID||''}));await load();}catch(e){setError(e.message);}};
  return <><PageHeader title={isVolunteer?'My Rescue Reports':'Rescue Monitoring'} description={isVolunteer?'Record a rescued local pet at the receiving shelter.':'Monitor rescue reports, receiving shelters and registered intake pets.'}/>
    {isVolunteer&&<form className="card form-card mb-4" onSubmit={submit}><h3>Submit Rescue Report</h3><div className="row g-3"><div className="col-md-4"><label className="form-label">Rescue Date <span className="required">*</span></label><input className="form-control" type="date" required value={form.rescueDate||''} onChange={e=>setForm({...form,rescueDate:e.target.value})}/></div><div className="col-md-4"><label className="form-label">Rescue Location <span className="required">*</span></label><input className="form-control" required value={form.location||''} onChange={e=>setForm({...form,location:e.target.value})}/></div><div className="col-md-4"><label className="form-label">Receiving Shelter <span className="required">*</span></label><select className="form-select" required value={form.shelterId||''} onChange={e=>setForm({...form,shelterId:e.target.value})}>{shelters.map(row=><option key={row.SHELTER_ID} value={row.SHELTER_ID}>{row.SHELTER_ID} - {row.ROOM_TYPE}</option>)}</select></div></div><h3 className="mt-4">Rescued Pet</h3><FormFields form={form} setForm={setForm} fields={[
      {name:'petName',label:'Pet Name',required:true},{name:'species',label:'Species',required:true},{name:'breed',label:'Breed'},
      {name:'dob',label:'Date of Birth',type:'date'},{name:'approximateAge',label:'Approximate Age',type:'number'},
      {name:'gender',label:'Gender',type:'select',options:['UNKNOWN','MALE','FEMALE'],required:true},
      {name:'weight',label:'Weight',type:'number'},{name:'intakeDate',label:'Shelter Intake Date',type:'date',required:true},
      {name:'adoptionStatus',label:'Adoption Status',type:'select',options:['ON_HOLD','AVAILABLE','PENDING'],required:true}
    ]}/><button className="btn btn-brand mt-3" disabled={!form.shelterId}>Save Rescue Report</button></form>}
    {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}
    {loading?<div className="loading">Loading rescue reports...</div>:<DataTable rows={rescueRowsForDisplay(rows)} columns={isVolunteer?['RESCUE_ID','RESCUE_DATE','LOCATION','SHELTER_ID','INTAKE_STATUS','PET_IDS']:rescueColumns}/>}
  </>;
}

function RescueIntake(){
  const [rows,setRows]=useState([]);const [active,setActive]=useState(null);const [form,setForm]=useState({gender:'UNKNOWN',adoptionStatus:'ON_HOLD'});const [message,setMessage]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true);setError('');try{setRows(await api('/api/rescues/intake'));}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const start=row=>{setActive(row);setForm({gender:'UNKNOWN',adoptionStatus:'ON_HOLD',intakeDate:new Date().toISOString().slice(0,10)});setMessage('');setError('');window.scrollTo({top:0,behavior:'smooth'});};
  const register=async event=>{event.preventDefault();setMessage('');setError('');try{const response=await api(`/api/rescues/${active.RESCUE_ID}/pets`,{method:'POST',body:JSON.stringify(form)});setMessage(response.message);setForm({gender:'UNKNOWN',adoptionStatus:'ON_HOLD',intakeDate:form.intakeDate});await load();}catch(e){setError(e.message);}};
  const complete=async row=>{if(!window.confirm(`Complete intake for rescue ${row.RESCUE_ID}?`))return;setMessage('');setError('');try{const response=await api(`/api/rescues/${row.RESCUE_ID}/complete-intake`,{method:'PUT'});setMessage(response.message);if(active?.RESCUE_ID===row.RESCUE_ID)setActive(null);await load();}catch(e){setError(e.message);}};
  return <><PageHeader title="Rescue Intake" description="Register rescued pets after they physically arrive at shelters assigned to you."/>
    {active&&<form className="card form-card mb-4" onSubmit={register}><h3>Register Pet for {active.RESCUE_ID}</h3><div className="ownership-note mb-3"><strong>Receiving Shelter:</strong><span>{active.SHELTER_ID}</span></div><FormFields form={form} setForm={setForm} fields={[
      {name:'name',label:'Pet Name',required:true},{name:'species',label:'Species',required:true},{name:'breed',label:'Breed'},
      {name:'dob',label:'Date of Birth',type:'date'},{name:'approximateAge',label:'Approximate Age',type:'number'},
      {name:'gender',label:'Gender',type:'select',options:['UNKNOWN','MALE','FEMALE'],required:true},
      {name:'weight',label:'Weight',type:'number'},{name:'intakeDate',label:'Intake Date',type:'date',required:true},
      {name:'adoptionStatus',label:'Adoption Status',type:'select',options:['ON_HOLD','AVAILABLE','PENDING'],required:true}
    ]}/><div className="mt-3 d-flex gap-2"><button className="btn btn-brand">Register Pet</button><button type="button" className="btn btn-outline-secondary" onClick={()=>setActive(null)}>Cancel</button></div></form>}
    {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}
    {loading?<div className="loading">Loading intake queue...</div>:<div className="card data-card"><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Rescue ID</th><th>Volunteer</th><th>Rescue Date</th><th>Location</th><th>Receiving Shelter</th><th>Status</th><th>Registered Pets</th><th>Action</th></tr></thead><tbody>{rows.length?rows.map(row=><tr key={row.RESCUE_ID}><td>{row.RESCUE_ID}</td><td>{row.VOLUNTEER_NAME}</td><td>{row.RESCUE_DATE?new Date(row.RESCUE_DATE).toLocaleDateString():'-'}</td><td>{row.LOCATION}</td><td>{row.SHELTER_ID}</td><td>{row.INTAKE_STATUS}</td><td>{row.PET_IDS||'None'}</td><td><div className="d-flex gap-2 flex-wrap">{row.INTAKE_STATUS!=='INTAKE_COMPLETED'&&row.INTAKE_STATUS!=='CANCELLED'&&<button className="btn btn-sm btn-brand" onClick={()=>start(row)}>{row.PET_IDS?'Add Another Pet':'Register Pet'}</button>}{row.INTAKE_STATUS==='INTAKE_IN_PROGRESS'&&<button className="btn btn-sm btn-success" onClick={()=>complete(row)}>Complete Intake</button>}</div></td></tr>):<tr><td colSpan="8" className="empty">No rescue reports waiting for your shelters</td></tr>}</tbody></table></div></div>}
  </>;
}
=======
  const [rows,setRows]=useState([]);const [search,setSearch]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  const load=async value=>{setLoading(true);setError('');try{setRows(await api(`/api/owners${value?`?search=${encodeURIComponent(value)}`:''}`));}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load('');},[]);
  return <><PageHeader title="Pet Owners" description={user.role==='EMPLOYEE'?'Find an owner and every guest pet registered in their name. New owners are created during guest-pet intake.':'Search owners and review every guest pet registered in their name.'}/>
    <form className="card form-card mb-4" onSubmit={event=>{event.preventDefault();load(search);}}><div className="row g-3 align-items-end"><div className="col-md-9"><label className="form-label">Owner ID, Name or Phone</label><input className="form-control" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search owner"/></div><div className="col-md-3"><button className="btn btn-brand w-100">Search</button></div></div></form>
    {error&&<div className="alert alert-danger">{error}</div>}{loading?<div className="loading">Loading pet owners…</div>:<DataTable rows={rows} columns={['OWNER_ID','OWNER_NAME','PHONE','OCCUPATION','PET_ID','PET_NAME','SPECIES','BREED','CHECK_IN_DATE','RELEVANT_TIME']}/>}</>;
}

function Rescues({user}){const readOnly=['ADMIN','VOLUNTEER'].includes(user.role);return <CrudPage readOnly={readOnly} title={user.role==='VOLUNTEER'?'My Assigned Rescues':'Rescue Operations'} description={user.role==='VOLUNTEER'?'Review rescue operations assigned specifically to you.':user.role==='ADMIN'?'Monitor rescue events, assigned volunteers and shelters.':'Record rescue events and assign the responsible volunteer and shelter.'} endpoint="/api/rescues" columns={['RESCUE_ID','RESCUE_DATE','LOCATION','SHELTER_ID','VOLUNTEER_ID','VOLUNTEER_NAME']} fields={[
  {name:'rescueId',label:'Rescue ID',required:true},{name:'rescueDate',label:'Rescue Date',type:'date',required:true},{name:'location',label:'Location',required:true},{name:'shelterId',label:'Shelter ID'},{name:'volunteerId',label:'Volunteer Person ID'}
]}/>;}
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0

function Donations({user}){
  const [rows,setRows]=useState([]);const [amount,setAmount]=useState('');const [message,setMessage]=useState('');const [error,setError]=useState('');
  const load=async()=>{try{setRows(await api('/api/donations'));}catch(e){setError(e.message);}};
  useEffect(()=>{load();},[]);
  const submit=async event=>{event.preventDefault();setMessage('');setError('');try{const response=await api('/api/donations',{method:'POST',body:JSON.stringify({amount})});setMessage(response.message);setAmount('');await load();}catch(e){setError(e.message);}};
<<<<<<< HEAD
  const isDonor=user.role==='DONOR';
  return <><PageHeader title={isDonor?'My Donations':'Donation Records'} description={isDonor?'Record a contribution and review only your donation history.':'Monitor recorded donation entries without exposing donor identities, categories or individual amounts.'}/>{isDonor&&<form className="card form-card mb-4" onSubmit={submit}><label className="form-label">Donation Amount <span className="required">*</span></label><input className="form-control" type="number" min="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount"/><button className="btn btn-brand mt-3">Record Donation</button></form>}{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<DataTable rows={rows} columns={isDonor?['SOURCE_ID','SOURCE_NAME','AMOUNT']:['SOURCE_ID','STATUS']}/></>;
=======
  return <><PageHeader title={user.role==='DONOR'?'My Donations':'Donation Monitoring'} description={user.role==='DONOR'?'Record a contribution and review your donation history.':'Monitor donations recorded by registered donors.'}/>{user.role==='DONOR'&&<form className="card form-card mb-4" onSubmit={submit}><label className="form-label">Donation Amount <span className="required">*</span></label><input className="form-control" type="number" min="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount"/><button className="btn btn-brand mt-3">Record Donation</button></form>}{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<DataTable rows={rows} columns={['SOURCE_ID','DONOR_NAME','SOURCE_NAME','AMOUNT']}/></>;
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
}

const adoptionColumns=['ADOPTION_ID','ADOPTER_NAME','PET_NAME','EMPLOYEE_NAME','SUPERVISOR_NAME','APPLY_DATE','REVIEW_DATE','STATUS'];
function adoptionValue(value,column){
  if(value===null||value===undefined||value==='')return 'Not assigned';
  if(['APPLY_DATE','REVIEW_DATE'].includes(column))return new Date(value).toLocaleDateString();
  return String(value);
}

function AdoptionTable({rows,renderAction}){
  return <div className="card data-card"><div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr>{adoptionColumns.map(column=><th key={column}>{column.replaceAll('_',' ')}</th>)}{renderAction&&<th>Action</th>}</tr></thead><tbody>{rows.length?rows.map(row=><tr key={row.ADOPTION_ID}>{adoptionColumns.map(column=><td key={column}>{column==='STATUS'?<span className={`adoption-status ${String(row.STATUS).toLowerCase()}`}>{row.STATUS}</span>:adoptionValue(row[column],column)}</td>)}{renderAction&&<td>{renderAction(row)}</td>}</tr>):<tr><td className="empty" colSpan={adoptionColumns.length+(renderAction?1:0)}>No adoption applications available</td></tr>}</tbody></table></div></div>;
}

function AdopterApplications(){
  const [rows,setRows]=useState([]);const [pets,setPets]=useState([]);const [localPetId,setLocalPetId]=useState('');const [message,setMessage]=useState('');const [error,setError]=useState('');
  const load=async()=>{try{const [applications,availablePets]=await Promise.all([api('/api/adoptions'),api('/api/adoptions/available-pets')]);setRows(applications);setPets(availablePets);setLocalPetId(current=>current||availablePets[0]?.PET_ID||'');}catch(e){setError(e.message);}};
  useEffect(()=>{load();},[]);
  const submit=async event=>{event.preventDefault();setMessage('');setError('');try{const response=await api('/api/adoptions',{method:'POST',body:JSON.stringify({localPetId})});setMessage(response.message);await load();}catch(e){setError(e.message);}};
<<<<<<< HEAD
  return <><PageHeader title="My Adoption Applications" description="Apply for an available pet and follow the status of your applications."/><form className="card form-card mb-4" onSubmit={submit}><h3>New adoption application</h3><div className="row g-3"><div className="col-md-8"><label className="form-label">Available Pet <span className="required">*</span></label><select className="form-select" value={localPetId} onChange={e=>setLocalPetId(e.target.value)} disabled={!pets.length}>{pets.length?pets.map(pet=><option key={pet.PET_ID} value={pet.PET_ID}>{pet.NAME} — {pet.SPECIES}{pet.BREED?` (${pet.BREED})`:''}</option>):<option>No pets are currently available</option>}</select></div><div className="col-md-4 d-flex align-items-end"><button className="btn btn-brand w-100" disabled={!localPetId}>Submit Application</button></div></div></form>{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<AdoptionTable rows={rows}/></>;
=======
  return <><PageHeader title="My Adoption Applications" description="Apply for an available pet and follow the status of your applications."/><form className="card form-card mb-4" onSubmit={submit}><h3>New adoption application</h3><div className="row g-3"><div className="col-md-8"><label className="form-label">Available Pet <span className="required">*</span></label><select className="form-select" value={localPetId} onChange={e=>setLocalPetId(e.target.value)} disabled={!pets.length}>{pets.length?pets.map(pet=><option key={pet.PET_ID} value={pet.PET_ID}>{pet.NAME} — {pet.SPECIES}{pet.BREED?` (${pet.BREED})`:''}</option>):<option>No pets are currently available</option>}</select></div><div className="col-md-4 d-flex align-items-end"><button className="btn btn-brand w-100" disabled={!localPetId}>Submit Application</button></div></div><small className="form-note">Application ID, date and pending status are created automatically.</small></form>{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<AdoptionTable rows={rows}/></>;
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
}

function SupervisorAdoptionReview(){
  const [rows,setRows]=useState([]);const [employees,setEmployees]=useState([]);const [assignments,setAssignments]=useState({});const [message,setMessage]=useState('');const [error,setError]=useState('');
  const load=async()=>{try{const [applications,activeEmployees]=await Promise.all([api('/api/adoptions'),api('/api/adoptions/employees')]);setRows(applications);setEmployees(activeEmployees);setAssignments(current=>Object.fromEntries(applications.map(row=>[row.ADOPTION_ID,current[row.ADOPTION_ID]||activeEmployees[0]?.PERSON_ID||''])));}catch(e){setError(e.message);}};
  useEffect(()=>{load();},[]);
  const review=async(row,decision)=>{setMessage('');setError('');try{const response=await api(`/api/adoptions/${row.ADOPTION_ID}/review`,{method:'PUT',body:JSON.stringify({decision,employeeId:decision==='APPROVED'?assignments[row.ADOPTION_ID]:null})});setMessage(response.message);await load();}catch(e){setError(e.message);}};
  return <><PageHeader title="Adoption Review" description="Review pending applications, approve or reject them, and assign an employee to approved cases."/>{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<AdoptionTable rows={rows} renderAction={row=>row.STATUS==='PENDING'?<div className="review-actions"><select className="form-select form-select-sm" value={assignments[row.ADOPTION_ID]||''} onChange={e=>setAssignments({...assignments,[row.ADOPTION_ID]:e.target.value})} disabled={!employees.length}>{employees.length?employees.map(employee=><option key={employee.PERSON_ID} value={employee.PERSON_ID}>{employee.FULL_NAME}{employee.POSITION?` — ${employee.POSITION}`:''}</option>):<option>No active employee account</option>}</select><button className="btn btn-sm btn-success" disabled={!assignments[row.ADOPTION_ID]} onClick={()=>review(row,'APPROVED')}>Approve & Assign</button><button className="btn btn-sm btn-outline-danger" onClick={()=>review(row,'REJECTED')}>Reject</button></div>:<span className="view-only">Reviewed</span>}/></>;
}

function EmployeeAssignedAdoptions(){
  const [rows,setRows]=useState([]);const [message,setMessage]=useState('');const [error,setError]=useState('');
  const load=async()=>{try{setRows(await api('/api/adoptions'));}catch(e){setError(e.message);}};
  useEffect(()=>{load();},[]);
<<<<<<< HEAD
  const markAdopted=async row=>{if(!window.confirm(`Mark ${row.ADOPTION_ID} as adopted?`))return;setMessage('');setError('');try{const response=await api(`/api/adoptions/${row.ADOPTION_ID}/adopt`,{method:'PUT'});setMessage(response.message);await load();}catch(e){setError(e.message);}};
  return <><PageHeader title="My Assigned Adoptions" description="View approved applications assigned to you and finalize the handover as adopted."/>{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<AdoptionTable rows={rows} renderAction={row=>row.STATUS==='APPROVED'?<button className="btn btn-sm btn-brand" onClick={()=>markAdopted(row)}>Mark Adopted</button>:<span className="view-only">{row.STATUS==='ADOPTED'?'Adopted':'No action'}</span>}/></>;
=======
  const complete=async row=>{if(!window.confirm(`Mark ${row.ADOPTION_ID} as completed?`))return;setMessage('');setError('');try{const response=await api(`/api/adoptions/${row.ADOPTION_ID}/complete`,{method:'PUT'});setMessage(response.message);await load();}catch(e){setError(e.message);}};
  return <><PageHeader title="My Assigned Adoptions" description="View approved applications assigned to you and complete the adoption handover."/>{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}<AdoptionTable rows={rows} renderAction={row=>row.STATUS==='APPROVED'?<button className="btn btn-sm btn-brand" onClick={()=>complete(row)}>Mark Completed</button>:<span className="view-only">{row.STATUS==='COMPLETED'?'Completed':'No action'}</span>}/></>;
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
}

function AdminAdoptionMonitoring(){
  const [rows,setRows]=useState([]);const [error,setError]=useState('');
  useEffect(()=>{api('/api/adoptions').then(setRows).catch(e=>setError(e.message));},[]);
<<<<<<< HEAD
  return <><PageHeader title="Adoption Monitoring" description="Monitor all applications, supervisor decisions and employee assignments. Administrative access is read-only."/>{error&&<div className="alert alert-danger">{error}</div>}<div className="monitor-note mb-3">Admin can view every adoption record but cannot approve, reject, assign or finalize an adoption.</div><AdoptionTable rows={rows}/></>;
=======
  return <><PageHeader title="Adoption Monitoring" description="Monitor all applications, supervisor decisions and employee assignments. Administrative access is read-only."/>{error&&<div className="alert alert-danger">{error}</div>}<div className="monitor-note mb-3">Admin can view every adoption record but cannot approve, reject, assign or complete an application.</div><AdoptionTable rows={rows}/></>;
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
}

function Adoptions({user}){
  if(user.role==='ADOPTER')return <AdopterApplications/>;
  if(user.role==='SUPERVISOR')return <SupervisorAdoptionReview/>;
  if(user.role==='EMPLOYEE')return <EmployeeAssignedAdoptions/>;
  return <AdminAdoptionMonitoring/>;
}

function Medical({user}){return <CrudPage readOnly={user.role==='ADMIN'} title="Health Records" description={user.role==='ADMIN'?'Monitor pet diagnoses, treatments, medicines and vaccination details.':"Record each pet's diagnosis, treatment, medicine and vaccination details."} endpoint="/api/medical" columns={['RECORD_ID','PET_NAME','HEALTH_STATUS','DIAGNOSIS','TREATMENT','MEDICINE_ID','VACCINE_ID']} fields={[
<<<<<<< HEAD
  {name:'petId',label:'Pet ID',required:true},{name:'healthStatus',label:'Health Status',required:true},{name:'diagnosis',label:'Diagnosis'},{name:'treatment',label:'Treatment'},{name:'medicineId',label:'Medicine ID'},{name:'vaccineId',label:'Vaccine ID'}
=======
  {name:'recordId',label:'Record ID',required:true},{name:'petId',label:'Pet ID',required:true},{name:'healthStatus',label:'Health Status',required:true},{name:'diagnosis',label:'Diagnosis'},{name:'treatment',label:'Treatment'},{name:'medicineId',label:'Medicine ID'},{name:'vaccineId',label:'Vaccine ID'}
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
]}/>;}

function Medicines({user}){return <CrudPage readOnly={user.role==='ADMIN'} title="Medicine Inventory" description={user.role==='ADMIN'?'Monitor medicine dosage and price information.':'Maintain medicine dosage and price information used in pet treatment.'} endpoint="/api/medicines" columns={['MEDICINE_ID','DOSAGE','PRICE']} fields={[
  {name:'medicineId',label:'Medicine ID',required:true},{name:'dosage',label:'Dosage',required:true},{name:'price',label:'Price',type:'number',required:true}
]}/>;}

function Vaccinations({user}){return <CrudPage readOnly={user.role==='ADMIN'} title="Vaccination Records" description={user.role==='ADMIN'?'Monitor vaccine dates, completed doses, next doses and costs.':'Track vaccine dates, completed doses, next doses and costs.'} endpoint="/api/vaccinations" columns={['VACCINE_ID','VACCINE_NAME','V_DATE','NUM_OF_DOSE','NEXT_DOSE','PRICE']} fields={[
  {name:'vaccineId',label:'Vaccine ID',required:true},{name:'vaccineName',label:'Vaccine Name',required:true},{name:'vDate',label:'Vaccination Date',type:'date',required:true},{name:'numOfDose',label:'Number of Doses',type:'number',required:true},{name:'nextDose',label:'Next Dose',type:'date'},{name:'price',label:'Price',type:'number',required:true}
]}/>;}

function Finance({user}){
  const [data,setData]=useState({summary:[],income:[],expenses:[]});
  const [kind,setKind]=useState('income');
  const [form,setForm]=useState({});
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const load=async()=>{
    setLoading(true);setError('');
    try{
      const response=await api('/api/finance');
      setData({
        summary:Array.isArray(response?.summary)?response.summary:[],
        income:Array.isArray(response?.income)?response.income:[],
        expenses:Array.isArray(response?.expenses)?response.expenses:[]
      });
    }catch(e){setError(e.message);}finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);
  const submit=async event=>{
    event.preventDefault();setError('');setMessage('');
    try{
      const response=await api(kind==='income'?'/api/income':'/api/expenses',{method:'POST',body:JSON.stringify(form)});
      setMessage(response.message||'Financial record saved successfully');setForm({});await load();
    }catch(e){setError(e.message);}
  };
  const summary=data.summary[0]||{};
  return <>
<<<<<<< HEAD
    <PageHeader title="Financial Overview" description="Protected administrative summary of opening funds, income, expenses and available balance for January–May 2026."/>
    {error&&<div className="alert alert-danger">{error}</div>}
    <div className="row g-3 mb-4">
      <StatCard label="Opening Balance" value={summary.OPENING_BALANCE} tone="green"/>
      <StatCard label="Total Income" value={summary.TOTAL_INCOME} tone="green"/>
      <StatCard label="Total Expenses" value={summary.TOTAL_EXPENSES} tone="orange"/>
      <StatCard label="Net Activity" value={summary.NET_ACTIVITY} tone="purple"/>
      <StatCard label="Available Balance" value={summary.AVAILABLE_BALANCE} tone="green"/>
=======
    <PageHeader title="Financial Overview" description="Monitor the current balance, income and operational expenses."/>
    {error&&<div className="alert alert-danger">{error}</div>}
    <div className="row g-3 mb-4">
      <StatCard label="Current Balance" value={summary.CURRENT_BALANCE} tone="green"/>
      <StatCard label="Total Income" value={summary.TOTAL_INCOME} tone="green"/>
      <StatCard label="Total Expenses" value={summary.TOTAL_EXPENSES} tone="orange"/>
      <StatCard label="Net Amount" value={summary.NET_AMOUNT} tone="purple"/>
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
    </div>
    {user.role!=='ADMIN'&&<form className="card form-card mb-4" onSubmit={submit}>
      <div className="finance-switch mb-3"><button type="button" className={`btn ${kind==='income'?'btn-brand':'btn-outline-secondary'}`} onClick={()=>setKind('income')}>Record Income</button><button type="button" className={`btn ${kind==='expense'?'btn-brand':'btn-outline-secondary'}`} onClick={()=>setKind('expense')}>Record Expense</button></div>
      <FormFields form={form} setForm={setForm} fields={[{name:'financeId',label:'Finance Account ID',required:true},{name:'sourceId',label:'Record ID',required:true},{name:'sourceName',label:kind==='income'?'Income Source':'Expense Purpose',required:true},{name:'amount',label:'Amount',type:'number',required:true}]}/>
      <button className="btn btn-brand mt-3">Save {kind==='income'?'Income':'Expense'}</button>
    </form>}
<<<<<<< HEAD
    {user.role==='ADMIN'&&<div className="monitor-note mb-4">Reporting period: January–May 2026. Administrative access is read-only.</div>}
=======
    {user.role==='ADMIN'&&<div className="monitor-note mb-4">Administrative access is read-only. Income and expense records can be monitored here.</div>}
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
    {message&&<div className="alert alert-success">{message}</div>}
    {loading?<div className="loading">Loading financial records…</div>:<div className="row g-4"><div className="col-xl-6"><DataTable rows={data.income} title="Income Records"/></div><div className="col-xl-6"><DataTable rows={data.expenses} title="Expense Records"/></div></div>}
  </>;
}

function Salary({user}){
  const [rows,setRows]=useState([]);const [payees,setPayees]=useState([]);const [form,setForm]=useState({payeeRole:'EMPLOYEE'});const [message,setMessage]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  const load=async()=>{setLoading(true);setError('');try{const salaryRows=await api('/api/salaries');setRows(salaryRows);if(user.role==='SUPERVISOR'){const people=await api('/api/salaries/payees');setPayees(people);setForm(current=>({...current,payeeId:current.payeeId||people.find(row=>row.PAYEE_ROLE===(current.payeeRole||'EMPLOYEE'))?.PERSON_ID||''}));}}catch(e){setError(e.message);}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const chooseRole=role=>{const first=payees.find(row=>row.PAYEE_ROLE===role);setForm({...form,payeeRole:role,payeeId:first?.PERSON_ID||''});};
  const rolePayees=payees.filter(row=>row.PAYEE_ROLE===form.payeeRole);
  const submit=async event=>{event.preventDefault();setMessage('');setError('');try{const response=await api('/api/salaries',{method:'POST',body:JSON.stringify(form)});setMessage(response.message);setForm({payeeRole:'EMPLOYEE',payeeId:payees.find(row=>row.PAYEE_ROLE==='EMPLOYEE')?.PERSON_ID||''});await load();}catch(e){setError(e.message);}};
  return <><PageHeader title="Payroll" description={user.role==='ADMIN'?'Monitor individual salary payments and the Supervisor who recorded each payment.':'Record one salary payment for one Supervisor, Employee or Doctor.'}/>
    {user.role==='SUPERVISOR'&&<form className="card form-card mb-4" onSubmit={submit}><div className="ownership-note mb-3"><strong>Recorded By:</strong><span>Your signed-in Supervisor account</span><small>Supervisor ID is attached automatically.</small></div><div className="row g-3">
      <div className="col-md-6 col-xl-4"><label className="form-label">Payee Role <span className="required">*</span></label><select className="form-select" value={form.payeeRole} onChange={e=>chooseRole(e.target.value)}>{['SUPERVISOR','EMPLOYEE','DOCTOR'].map(role=><option key={role}>{role}</option>)}</select></div>
      <div className="col-md-6 col-xl-4"><label className="form-label">Payee <span className="required">*</span></label><select className="form-select" value={form.payeeId||''} onChange={e=>setForm({...form,payeeId:e.target.value})}>{rolePayees.length?rolePayees.map(row=><option key={row.PERSON_ID} value={row.PERSON_ID}>{row.FULL_NAME} — {row.PERSON_ID}</option>):<option value="">No person in this role</option>}</select></div>
      <div className="col-md-6 col-xl-4"><label className="form-label">Salary Month <span className="required">*</span></label><input className="form-control" type="month" value={form.salaryMonth||''} onChange={e=>setForm({...form,salaryMonth:e.target.value})}/></div>
      <div className="col-md-6 col-xl-4"><label className="form-label">Payment Date <span className="required">*</span></label><input className="form-control" type="date" value={form.paymentDate||''} onChange={e=>setForm({...form,paymentDate:e.target.value})}/></div>
      <div className="col-md-6 col-xl-4"><label className="form-label">Salary Amount <span className="required">*</span></label><input className="form-control" type="number" min="1" value={form.salaryAmount||''} onChange={e=>setForm({...form,salaryAmount:e.target.value})}/></div>
    </div><button className="btn btn-brand mt-3" disabled={!form.payeeId}>Record Salary Payment</button></form>}
    {user.role==='ADMIN'&&<div className="monitor-note mb-4">Administrative access is read-only. Each row represents one payment to one person.</div>}{message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-danger">{error}</div>}{loading?<div className="loading">Loading payroll…</div>:<DataTable rows={rows} columns={['SALARY_ID','PAYEE_NAME','PAYEE_ROLE','SALARY_MONTH','PAYMENT_DATE','SALARY_AMOUNT','RECORDED_BY','SOURCE_NAME']}/>}</>;
}

function QueryLab(){
  const [catalog,setCatalog]=useState([]);const [selected,setSelected]=useState(null);const [error,setError]=useState('');const groups=useGrouped(catalog,'group');
<<<<<<< HEAD
  const groupLabels=['Quick Reports','Calculated Insights','Connected Records','Advanced Reports','Combined Lists','Workflow Analysis','Saved Reports','Structured Addresses'];
  useEffect(()=>{api('/api/query-lab').then(setCatalog).catch(e=>setError(e.message));},[]);
  const run=async key=>{setError('');try{setSelected(await api(`/api/query-lab/${key}`));}catch(e){setError(e.message);}};
  return <><PageHeader title="PetCare Insights" description="Explore live operational reports across pets, people, adoption and care."/>{error&&<div className="alert alert-danger">{error}</div>}<div className="query-layout"><div className="query-menu">{Object.entries(groups).map(([group,items],index)=><div key={group}><h4>{groupLabels[index]||'Reports'}</h4>{items.map(item=><button key={item.key} className={selected?.key===item.key?'active':''} onClick={()=>run(item.key)}>{item.title}</button>)}</div>)}</div><div className="query-result">{selected?<><div className="card feature-card mb-3"><span className="topic-label">REPORT</span><h2>{selected.title}</h2></div><DataTable rows={selected.rows}/></>:<div className="empty-state"><h3>Select a report</h3><p>Choose a report from the left to view its result.</p></div>}</div></div></>;
}

function SystemActivity(){
  return <CrudPage readOnly title="Adoption Decision History" description="See who applied for which pet, the final decision and the staff member who performed it." endpoint="/api/activity-log" columns={['AUDIT_ID','APPLICATION_ID','APPLICANT_NAME','PET_NAME','PET_ID','DECISION','PERFORMED_BY','PERFORMED_BY_ROLE','ACTION_DATE']} searchConfig={{label:'Exact Application ID, Applicant, Pet ID, Pet Name or Decision',placeholder:'Example: AD001, Rashed Mahmud, LP001, Luna, or Rejected'}}/>;
=======
  const groupNames={'Simple Query':'Quick Reports','Function':'Calculated Insights','Join':'Connected Records','Subquery':'Advanced Reports','Set Operation':'Combined Lists','View':'Saved Reports','Abstract Data Type':'Structured Addresses'};
  useEffect(()=>{api('/api/query-lab').then(setCatalog).catch(e=>setError(e.message));},[]);
  const run=async key=>{setError('');try{setSelected(await api(`/api/query-lab/${key}`));}catch(e){setError(e.message);}};
  return <><PageHeader title="PetCare Insights" description="Explore live operational reports across pets, people, adoption and care."/>{error&&<div className="alert alert-danger">{error}</div>}<div className="query-layout"><div className="query-menu">{Object.entries(groups).map(([group,items])=><div key={group}><h4>{groupNames[group]||group}</h4>{items.map(item=><button key={item.key} className={selected?.key===item.key?'active':''} onClick={()=>run(item.key)}>{item.title}</button>)}</div>)}</div><div className="query-result">{selected?<><div className="card feature-card mb-3"><span className="topic-label">LIVE REPORT</span><h2>{selected.title}</h2><p>{selected.description}</p></div><DataTable rows={selected.rows}/></>:<div className="empty-state"><h3>Select a report</h3><p>Choose a report from the left to view its live result.</p></div>}</div></div></>;
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
}

function UtilityResult({result}){
  const data=result.rows?.[0]||result.result||{};
  const keys=Object.keys(data);
  const isAge=keys.some(key=>key.toUpperCase()==='PERSON_AGE');
  const isPetSummary=keys.some(key=>key.toLowerCase()==='total');
  const title=isAge?'Age & Availability Summary':isPetSummary?'Pet Availability Overview':'Person Search Result';
  const description=isAge?'The requested age and current adoption availability are shown below.':isPetSummary?'A quick summary of the pets currently managed by the shelter.':'The person lookup completed safely and returned the following information.';
<<<<<<< HEAD
  const labels={PERSON_AGE:'Person Age',PERSON_AGE_STATUS:'Age Lookup Status',AVAILABLE_PETS:'Available Pets',total:'Registered Pets',available:'Available for Adoption',fullName:'Person Name',message:'Status'};
  const displayResultValue=(key,value)=>key==='PERSON_AGE'&&value==null?'NO_DATA_FOUND':value??'Not available';
  return <div className="card utility-result mt-4">
    <div className="result-heading"><div className="result-icon">✓</div><div><span>RESULT READY</span><h3>{title}</h3><p>{description}</p></div></div>
    <div className="result-grid">{Object.entries(data).map(([key,value])=><div className="result-item" key={key}><span>{labels[key]||labels[key.toUpperCase()]||key.replaceAll('_',' ')}</span><strong className={String(displayResultValue(key,value)).length>18?'compact':''}>{displayResultValue(key,value)}</strong></div>)}</div>
=======
  const labels={PERSON_AGE:'Person Age',AVAILABLE_PETS:'Available Pets',total:'Registered Pets',available:'Available for Adoption',fullName:'Person Name',message:'Status'};
  return <div className="card utility-result mt-4">
    <div className="result-heading"><div className="result-icon">✓</div><div><span>RESULT READY</span><h3>{title}</h3><p>{description}</p></div></div>
    <div className="result-grid">{Object.entries(data).map(([key,value])=><div className="result-item" key={key}><span>{labels[key]||labels[key.toUpperCase()]||key.replaceAll('_',' ')}</span><strong className={String(value).length>18?'compact':''}>{value??'Not available'}</strong></div>)}</div>
    <div className="result-note"><span>{result.title}</span><p>{result.description}</p></div>
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
  </div>;
}

function PlsqlLab(){
  const [personId,setPersonId]=useState('P001');const [missingId,setMissingId]=useState('P999');const [result,setResult]=useState(null);const [error,setError]=useState('');
  const run=async path=>{setError('');try{setResult(await api(path));}catch(e){setError(e.message);}};
<<<<<<< HEAD
  return <><PageHeader title="Smart PetCare Tools" description="Quick tools for age calculation, pet availability and safe person lookup."/>{error&&<div className="alert alert-danger">{error}</div>}<div className="row g-4"><div className="col-lg-4"><div className="card lab-card"><span>AGE</span><h3>Age Calculator</h3><p>Calculate a registered person's age.</p><input className="form-control mb-2" value={personId} onChange={e=>setPersonId(e.target.value)}/><button className="btn btn-brand" onClick={()=>run(`/api/plsql/function/${personId}`)}>Calculate Age</button></div></div><div className="col-lg-4"><div className="card lab-card"><span>PETS</span><h3>Pet Availability Summary</h3><p>Generate totals for registered and available pets.</p><button className="btn btn-brand" onClick={()=>run('/api/plsql/cursor')}>Generate Summary</button></div></div><div className="col-lg-4"><div className="card lab-card"><span>LOOKUP</span><h3>Person Lookup</h3><p>Safely search even when an ID does not exist.</p><input className="form-control mb-2" value={missingId} onChange={e=>setMissingId(e.target.value)}/><button className="btn btn-brand" onClick={()=>run(`/api/plsql/exception/${missingId}`)}>Search Person</button></div></div></div>{result&&<UtilityResult result={result}/>}</>;
}

const pages={
  'Dashboard':user=><Dashboard user={user}/>,'My Profile':()=> <MyProfile/>,'User Accounts':()=> <UserAccounts/>,'Staff Employment':()=> <StaffEmployment/>,'System Activity':()=> <SystemActivity/>,'People Directory':user=> <People user={user}/>,'Pet Owners':user=> <PetOwners user={user}/>,'Emergency Contacts':user=> <Emergency user={user}/>,'Team Management':()=> <Roles/>,
  'Shelter Management':user=> <Shelters user={user}/>,'Pet Directory':user=> <Pets user={user}/>,'Rescue Operations':user=> <Rescues user={user}/>,'Rescue Intake':()=> <RescueIntake/>,'My Rescue Reports':user=> <Rescues user={user}/>,'Adoption Monitoring':user=><Adoptions user={user}/>,'Adoption Review':user=><Adoptions user={user}/>,'My Assigned Adoptions':user=><Adoptions user={user}/>,'My Adoption Applications':user=><Adoptions user={user}/>,'Health Records':user=> <Medical user={user}/>,
  'Medicine Inventory':user=> <Medicines user={user}/>,'Vaccination Records':user=> <Vaccinations user={user}/>,'Financial Overview':user=> <Finance user={user}/>,'Payroll':user=> <Salary user={user}/>,
  'My Donations':user=> <Donations user={user}/>,'Donation Monitoring':user=> <Donations user={user}/>,'My Registered Pets':()=> <MyOwnedPets/>,'Role Applications':()=> <RoleApplications/>,'Insights & Reports':()=> <QueryLab/>,'Smart PetCare Tools':()=> <PlsqlLab/>
=======
  return <><PageHeader title="Smart PetCare Tools" description="Quick tools for age calculation, pet availability and safe person lookup."/>{error&&<div className="alert alert-danger">{error}</div>}<div className="row g-4"><div className="col-lg-4"><div className="card lab-card"><span>STORED FUNCTION</span><h3>Age Calculator</h3><p>Calculate a registered person's age.</p><input className="form-control mb-2" value={personId} onChange={e=>setPersonId(e.target.value)}/><button className="btn btn-brand" onClick={()=>run(`/api/plsql/function/${personId}`)}>Calculate Age</button></div></div><div className="col-lg-4"><div className="card lab-card"><span>CURSOR</span><h3>Pet Availability Summary</h3><p>Generate totals for registered and available pets.</p><button className="btn btn-brand" onClick={()=>run('/api/plsql/cursor')}>Generate Summary</button></div></div><div className="col-lg-4"><div className="card lab-card"><span>EXCEPTION HANDLING</span><h3>Person Lookup</h3><p>Safely search even when an ID does not exist.</p><input className="form-control mb-2" value={missingId} onChange={e=>setMissingId(e.target.value)}/><button className="btn btn-brand" onClick={()=>run(`/api/plsql/exception/${missingId}`)}>Search Person</button></div></div></div>{result&&<UtilityResult result={result}/>}</>;
}

function DatabaseDesign(){return <><PageHeader title="Database Design" description="The final ER-to-relational design and the exact course concepts used in this project."/><div className="row g-4"><div className="col-lg-6"><div className="card feature-card"><h3>Final ER mapping</h3><ul><li>PERSON and PET use supertype/subtype tables.</li><li>PERSON_PHONE and PERSON_ADDRESS represent multivalued attributes.</li><li>EMERGENCY_NO is a weak entity with composite key.</li><li>GUEST_PET_OWNER links each owner to one or more guest pets.</li><li>SALARY records one payee and the Supervisor who recorded the payment.</li></ul></div></div><div className="col-lg-6"><div className="card feature-card"><h3>Relational design</h3><ul><li>Primary Key, Foreign Key, UNIQUE, CHECK and NOT NULL constraints.</li><li>Tables are normalized and repeated facts are separated.</li><li>Age is derived from Date of Birth.</li><li>ADDRESS_TYPE demonstrates Abstract Data Type without duplicating stored data.</li></ul></div></div><div className="col-12"><div className="card feature-card"><h3>Project Update-2 coverage</h3><div className="coverage-grid">{['100% frontend navigation','Functional frontend queries','Function','Subquery','View','Abstract Data Type','PL/SQL','Cursor','Exception Handling','Final ER and Schema'].map(x=><span key={x}>✓ {x}</span>)}</div></div></div></div></>};

const pages={
  'Dashboard':user=><Dashboard user={user}/>,'My Profile':()=> <MyProfile/>,'User Accounts':()=> <UserAccounts/>,'People Directory':user=> <People user={user}/>,'Pet Owners':user=> <PetOwners user={user}/>,'Emergency Contacts':user=> <Emergency user={user}/>,'Team Management':()=> <Roles/>,
  'Shelter Management':user=> <Shelters user={user}/>,'Pet Directory':user=> <Pets user={user}/>,'Rescue Operations':user=> <Rescues user={user}/>,'My Assigned Rescues':user=> <Rescues user={user}/>,'Adoption Monitoring':user=><Adoptions user={user}/>,'Adoption Review':user=><Adoptions user={user}/>,'My Assigned Adoptions':user=><Adoptions user={user}/>,'My Adoption Applications':user=><Adoptions user={user}/>,'Health Records':user=> <Medical user={user}/>,
  'Medicine Inventory':user=> <Medicines user={user}/>,'Vaccination Records':user=> <Vaccinations user={user}/>,'Financial Overview':user=> <Finance user={user}/>,'Payroll':user=> <Salary user={user}/>,
  'My Donations':user=> <Donations user={user}/>,'Donation Monitoring':user=> <Donations user={user}/>,'Insights & Reports':()=> <QueryLab/>,'Smart PetCare Tools':()=> <PlsqlLab/>,'Data Model':()=> <DatabaseDesign/>
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
};

export default function App(){
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem('user')||'null'));
  const [page,setPage]=useState('Dashboard');
  useEffect(()=>{
    const expireSession=()=>{setUser(null);setPage('Dashboard');};
<<<<<<< HEAD
    const updateRoles=event=>setUser(current=>{if(!current)return current;const next={...current,roles:event.detail};localStorage.setItem('user',JSON.stringify(next));return next;});
    window.addEventListener('petcare:session-expired',expireSession);
    window.addEventListener('petcare:roles-updated',updateRoles);
    return ()=>{window.removeEventListener('petcare:session-expired',expireSession);window.removeEventListener('petcare:roles-updated',updateRoles);};
  },[]);
  if(!user)return <Login onLogin={setUser}/>;
  const renderPage=pages[page]||pages.Dashboard;
  const switchRole=async role=>{try{const data=await api('/api/auth/switch-role',{method:'POST',body:JSON.stringify({role})});localStorage.setItem('token',data.token);localStorage.setItem('user',JSON.stringify(data.user));setUser(data.user);setPage('Dashboard');}catch(error){window.alert(error.message);}};
  return <Layout user={user} page={page} setPage={setPage} onSwitchRole={switchRole} onLogout={()=>{localStorage.removeItem('token');localStorage.removeItem('user');setUser(null);setPage('Dashboard');}}><PageErrorBoundary key={`${page}-${user.role}`}>{renderPage(user)}</PageErrorBoundary></Layout>;
=======
    window.addEventListener('petcare:session-expired',expireSession);
    return ()=>window.removeEventListener('petcare:session-expired',expireSession);
  },[]);
  if(!user)return <Login onLogin={setUser}/>;
  const renderPage=pages[page]||pages.Dashboard;
  return <Layout user={user} page={page} setPage={setPage} onLogout={()=>{localStorage.removeItem('token');localStorage.removeItem('user');setUser(null);setPage('Dashboard');}}><PageErrorBoundary key={page}>{renderPage(user)}</PageErrorBoundary></Layout>;
>>>>>>> d69b99fc92d668a555103a21fad44187994cefc0
}
