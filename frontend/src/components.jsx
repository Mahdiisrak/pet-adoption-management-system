import React,{useEffect,useMemo,useState} from 'react';
import {api} from './api';

export function PageHeader({title,description}){
  return <div className="page-header mb-4"><h1>{title}</h1><p>{description}</p></div>;
}

function labelOf(value){return value.replaceAll('_',' ').replace(/\b\w/g,letter=>letter.toUpperCase());}
function displayValue(value){
  if(value===null||value===undefined||value==='')return '—';
  if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value))return new Date(value).toLocaleDateString();
  return String(value);
}

export function DataTable({rows=[],columns,title,renderActions,emptyMessage='No records available'}){
  const visible=columns||Object.keys(rows[0]||{});
  return <div className="card data-card">
    {title&&<div className="card-header"><strong>{title}</strong></div>}
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead><tr>{visible.map(column=><th key={column}>{labelOf(column)}</th>)}{renderActions&&<th>Action</th>}</tr></thead>
        <tbody>{rows.length?rows.map((row,index)=><tr key={index}>{visible.map(column=><td key={column}>{displayValue(row[column])}</td>)}{renderActions&&<td>{renderActions(row)}</td>}</tr>):<tr><td colSpan={Math.max(1,visible.length+(renderActions?1:0))} className="empty">{emptyMessage}</td></tr>}</tbody>
      </table>
    </div>
  </div>;
}

export function FormFields({fields,form,setForm}){
  return <div className="row g-3">{fields.filter(field=>!field.showWhen||field.showWhen(form)).map(field=>{const isRequired=typeof field.required==='function'?field.required(form):field.required;return <div className={field.wide?'col-12':'col-md-6 col-xl-4'} key={field.name}>
    <label className="form-label">{field.label}{isRequired&&<span className="required"> *</span>}</label>
    {field.type==='select'?<select className="form-select" required={isRequired} value={form[field.name]??field.options?.[0]??''} onChange={event=>setForm({...form,[field.name]:event.target.value})}>
      {(field.options||[]).map(option=><option key={option} value={option}>{labelOf(option)}</option>)}
    </select>:<input className="form-control" required={isRequired} type={field.type||'text'} placeholder={field.placeholder||field.label} value={form[field.name]??''} onChange={event=>setForm({...form,[field.name]:event.target.value})}/>} 
  </div>;})}</div>;
}

export function CrudPage({title,description,endpoint,columns,fields,initial={},mapPayload,method='POST',extra,readOnly=false,searchConfig,editConfig,canEdit=false}){
  const [rows,setRows]=useState([]);
  const [form,setForm]=useState(initial);
  const [search,setSearch]=useState('');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [editingId,setEditingId]=useState('');
  const load=async(value='')=>{
    setLoading(true);setError('');
    try{
      const requestPath=value?`${endpoint}${endpoint.includes('?')?'&':'?'}search=${encodeURIComponent(value)}`:endpoint;
      const data=await api(requestPath);setRows(Array.isArray(data)?data:[]);
    }catch(e){setError(e.message);}finally{setLoading(false);}
  };
  useEffect(()=>{load('');},[endpoint]);
  const submit=async event=>{
    event.preventDefault();setMessage('');setError('');
    try{
      const payload=mapPayload?mapPayload(form):form;
      const target=editingId?`${endpoint}/${encodeURIComponent(editingId)}`:endpoint;
      const data=await api(target,{method:editingId?'PUT':method,body:JSON.stringify(payload)});
      setMessage(data.message||'Saved successfully');setForm(initial);setEditingId('');await load(search.trim());
    }catch(e){setError(e.message);}
  };
  return <>
    <PageHeader title={title} description={description}/>
    {(!readOnly||editingId)&&<form className="card form-card mb-4" onSubmit={submit}>
      <FormFields fields={fields} form={form} setForm={setForm}/>
      <div className="mt-3 d-flex gap-2"><button className="btn btn-brand" type="submit">{editingId?'Update':'Save'}</button>{editingId&&<button className="btn btn-outline-secondary" type="button" onClick={()=>{setEditingId('');setForm(initial);}}>Cancel Edit</button>}</div>
    </form>}
    {searchConfig&&<form className="card form-card mb-4" onSubmit={event=>{event.preventDefault();load(search.trim());}}><div className="row g-3 align-items-end"><div className="col-md-9"><label className="form-label">{searchConfig.label}</label><input className="form-control" value={search} onChange={event=>setSearch(event.target.value)} placeholder={searchConfig.placeholder}/>{searchConfig.note&&<small className="form-note">{searchConfig.note}</small>}</div><div className="col-md-3"><button className="btn btn-brand w-100">Search</button></div></div></form>}
    {message&&<div className="alert alert-success">{message}</div>}
    {error&&<div className="alert alert-danger">{error}</div>}
    {extra?.({rows,load})}
    {loading?<div className="loading">Loading records…</div>:<DataTable rows={rows} columns={columns} renderActions={canEdit&&editConfig?(row)=><button className="btn btn-sm btn-outline-primary" onClick={()=>{setEditingId(row[editConfig.key]);setForm({...initial,...editConfig.toForm(row)});window.scrollTo({top:0,behavior:'smooth'});}}>Edit</button>:null}/>} 
  </>;
}

export function StatCard({label,value,tone='blue'}){
  return <div className="col-sm-6 col-xl-3"><div className={`stat-card ${tone}`}><span>{label}</span><strong>{value??0}</strong></div></div>;
}

export function useGrouped(items,key){
  return useMemo(()=>items.reduce((groups,item)=>{(groups[item[key]]||=[]).push(item);return groups;},{}),[items,key]);
}
