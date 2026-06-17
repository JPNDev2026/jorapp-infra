/// <reference path="../pb_data/types.d.ts" />
//
// data.pb.js  —  À déposer dans /opt/pb-mobilier/pb_hooks/
//
// Navigateur de données. Route publique en lecture seule, exécutée en contexte
// serveur (les list-rules des collections restent fermées).
//
//   GET /api/data?table=T                      -> liste complète de T
//   GET /api/data?table=T&id=ID                -> fiche (expand profond niveau 2)
//   GET /api/data?table=U&fromTable=T&fromId=ID-> liste contextuelle liens(T,ID,U)
//   (ajouter &debug=1 pour diagnostiquer)
//
// Tout est DANS le handler : un hook PocketBase n'a pas accès à la portée du fichier.
//
// IMPORTANT : tout le fichier est encapsulé dans une IIFE.
// PocketBase évalue tous les .pb.js dans le MÊME scope global ; sans cette
// isolation, `const REQUIRE_SUPERUSER`/`const handler` entrent en collision
// avec les autres hooks et cassent l'enregistrement des routes.
(function(){

const REQUIRE_SUPERUSER = false

const handler = (e) => {
 try {
  // ───────────────────────── config / helpers ─────────────────────────
  const MODE = { Realisation:"fiche", Projets:"liste", Modules:"liste" } // sinon "tableau"

  function toStr(v){
    if (v==null) return ""
    if (typeof v==="string") return v
    if (v instanceof ArrayBuffer) v=new Uint8Array(v)
    try{ let s="",CH=8192; for(let i=0;i<v.length;i+=CH){ s+=String.fromCharCode.apply(null,Array.prototype.slice.call(v,i,i+CH)); } return s }
    catch(_){ return String(v) }
  }
  function safeId(s){ return (""+s).replace(/[^a-zA-Z0-9_]/g,"") }
  function fetchById(coll,id){ if(!id) return null; try{ return $app.findRecordById(coll,id) }catch(_){ return null } }
  function byFilter(coll,filter){ try{ return $app.findRecordsByFilter(coll,filter,"-created",500,0) }catch(_){ return [] } }

  // ── métadonnées des collections (une seule fois) ──
  const all = $app.findAllCollections()
  const meta = {}
  for (let i=0;i<all.length;i++){
    const c=all[i]; if(c.system) continue
    let fdef=[]; try{ fdef=JSON.parse(toStr(c.fields.marshalJSON())) }catch(_){}
    const relations=[], relByName={}, typeOf={}, selectValues={}, maxSel={}
    for(let j=0;j<fdef.length;j++){
      const f=fdef[j]; typeOf[f.name]=f.type; maxSel[f.name]=f.maxSelect||0
      if(f.type==="relation"&&f.collectionId){
        const tgt=(function(){ for(let k=0;k<all.length;k++){ if(all[k].id===f.collectionId) return all[k].name } return f.collectionId })()
        const r={name:f.name,target:tgt,multiple:!!(f.maxSelect&&f.maxSelect>1)}
        relations.push(r); relByName[f.name]=r
      }
      if(f.type==="select"&&f.values) selectValues[f.name]=f.values
    }
    meta[c.name]={ id:c.id, name:c.name, fields:fdef, relations, relByName, typeOf, selectValues, maxSel }
  }

  // ── lecture de valeurs ──
  function relIds(rec,field,multiple){
    try{
      if(multiple) return (rec.getStringSlice(field)||[]).filter(Boolean)
      const v=rec.getString(field); return v?[v]:[]
    }catch(_){ return [] }
  }
  function fieldValue(rec,f){
    try{
      const t=f.type
      if(t==="bool") return rec.getBool(f.name)
      if(t==="number") return rec.get(f.name)
      if(t==="geoPoint") return rec.get(f.name)
      if(t==="select"&&f.maxSelect&&f.maxSelect>1) return rec.getStringSlice(f.name)||[]
      return rec.getString(f.name)
    }catch(_){ return "" }
  }

  // ── libellés (cf. spec §4), avec cache + garde anti-cycle ──
  const _lib={}
  function libRec(coll,rec){
    const nameOf=(field)=>{ const r=meta[coll].relByName[field]; if(!r) return ""; const ids=relIds(rec,field,r.multiple); return ids.map(id=>lib(r.target,id)).filter(Boolean).join(", ") }
    const g=(f)=>{ try{ return rec.getString(f) }catch(_){ return "" } }
    switch(coll){
      case "Familles":      return g("typologies")||rec.id
      case "Licences":      return g("type")||rec.id
      case "Essences":      return [g("nom"),g("categories")].filter(Boolean).join(" · ")||rec.id
      case "Contributions": return [g("types"),g("contributeurs")].filter(Boolean).join(" — ")||rec.id
      case "Projets":       return ("Projet "+nameOf("collectivite")).trim()
      case "Coalitions":    return ("Coalition "+[g("type"),nameOf("projet")].filter(Boolean).join(" → ")).trim()
      case "Affectations":  return [nameOf("projet"),g("statuts")].filter(Boolean).join(" · ")||rec.id
      case "Realisation":   return [nameOf("plan"),nameOf("collectivite")].filter(Boolean).join(" — ")||rec.id
      default:              return g("nom")||g("type")||rec.id
    }
  }
  function lib(coll,id){
    if(!id||!meta[coll]) return id||""
    const key=coll+"::"+id
    if(key in _lib) return _lib[key]
    _lib[key]=id  // garde anti-cycle
    const rec=fetchById(coll,id)
    const v=rec?libRec(coll,rec):id
    _lib[key]=v; return v
  }

  // ── DTO d'un enregistrement ──
  function dto(coll,rec,depth){
    const m=meta[coll]; const fields={}; const relations={}
    for(let i=0;i<m.fields.length;i++){
      const f=m.fields[i]
      if(f.name==="id") continue
      if(f.type==="relation"){
        const r=m.relByName[f.name]; const ids=relIds(rec,f.name,r.multiple)
        relations[f.name]=ids.map(id=>{
          const item={table:r.target,id:id,libelle:lib(r.target,id)}
          if(depth>1){ const sub=fetchById(r.target,id); if(sub) item.relations=dto(r.target,sub,depth-1).relations }
          return item
        })
      } else if(f.type==="file"){
        let names=[]; try{ names=rec.getStringSlice(f.name)||[] }catch(_){ const s=(function(){try{return rec.getString(f.name)}catch(_){return ""}})(); names=s?[s]:[] }
        fields[f.name]=names.map(n=>({filename:n,url:"/api/files/"+m.id+"/"+rec.id+"/"+n}))
      } else {
        fields[f.name]=fieldValue(rec,f)
      }
    }
    return { id:rec.id, table:coll, libelle:libRec(coll,rec), fields:fields, relations:relations }
  }

  // ── résolveur liens(T, idR, U) ──
  function multiRole(srcColl,tgtColl,fieldName){
    let n=0; const rs=meta[srcColl].relations; for(let i=0;i<rs.length;i++) if(rs[i].target===tgtColl) n++
    return n>1?fieldName:""
  }
  function indirect(T,idR,U,add){
    if(!meta["Affectations"]) return
    const sid=safeId(idR)
    const getMulti=(a,f)=>relIds(a,f,true)
    if(T==="Projets"&&U==="Modules"){ byFilter("Affectations","projet = '"+sid+"'").forEach(a=>getMulti(a,"modules").forEach(id=>add(id,"via Affectations"))) }
    else if(T==="Modules"&&U==="Projets"){ byFilter("Affectations","modules ~ '"+sid+"'").forEach(a=>{ relIds(a,"projet",false).forEach(id=>add(id,"via Affectations")) }) }
    else if(T==="Modules"&&U==="Acteurs"){ byFilter("Affectations","modules ~ '"+sid+"'").forEach(a=>getMulti(a,"prestataires").forEach(id=>add(id,"via Affectations"))) }
    else if(T==="Acteurs"&&U==="Modules"){ byFilter("Affectations","prestataires ~ '"+sid+"'").forEach(a=>getMulti(a,"modules").forEach(id=>add(id,"via Affectations"))) }
  }
  function liens(T,idR,U){
    if(!meta[T]||!meta[U]) return []
    const out={}; const order=[]
    const add=(id,role)=>{ if(id&&!(id in out)){ out[id]={id,role}; order.push(id) } }
    // direct T -> U
    const recR=fetchById(T,idR)
    if(recR){ meta[T].relations.forEach(rf=>{ if(rf.target===U) relIds(recR,rf.name,rf.multiple).forEach(id=>add(id,multiRole(T,U,rf.name))) }) }
    // direct U -> T
    const sid=safeId(idR)
    meta[U].relations.forEach(uf=>{ if(uf.target===T){ const op=uf.multiple?"~":"="; byFilter(U,uf.name+" "+op+" '"+sid+"'").forEach(r=>add(r.id,multiRole(U,T,uf.name))) } })
    // indirect via Affectations
    indirect(T,idR,U,add)
    // build DTOs
    return order.map(id=>{ const r=fetchById(U,id); const d=r?dto(U,r,1):{id:id,table:U,libelle:lib(U,id),fields:{},relations:{}}; if(out[id].role) d.role=out[id].role; return d })
  }

  // ── facettes (options des champs select, lues sur le schéma) ──
  function facets(coll){ const m=meta[coll]; const out={}; for(const k in m.selectValues) out[k]=m.selectValues[k]; return out }
  function modeOf(coll){ return MODE[coll]||"tableau" }

  // ───────────────────────── dispatch ─────────────────────────
  const q=e.requestInfo().query||{}
  const table=q.table||"", id=q.id||"", fromTable=q.fromTable||"", fromId=q.fromId||""

  if(q.debug){ return e.json(200,{debug:{params:{table,id,fromTable,fromId},tables:Object.keys(meta)}}) }
  if(!table) return e.json(400,{error:"paramètre 'table' requis"})
  if(!meta[table]) return e.json(404,{error:"table inconnue: "+table,tables:Object.keys(meta)})

  if(id){
    const rec=fetchById(table,id)
    return e.json(200,{ table:table, mode:modeOf(table), record: rec?dto(table,rec,2):null })
  }
  if(fromTable&&fromId){
    const records=liens(fromTable,fromId,table)
    return e.json(200,{ table:table, mode:modeOf(table), fromTable:fromTable, fromId:fromId, count:records.length, records:records, facets:facets(table) })
  }
  // liste complète
  const recs=$app.findAllRecords(table)
  const records=[]; for(let i=0;i<recs.length;i++) records.push(dto(table,recs[i],1))
  return e.json(200,{ table:table, mode:modeOf(table), count:records.length, records:records, facets:facets(table) })

 } catch(err){
   return e.json(500,{ debug_error:String((err&&err.message)||err), debug_stack:String((err&&err.stack)||"") })
 }
}

if (REQUIRE_SUPERUSER) routerAdd("GET","/api/data",handler,$apis.requireSuperuserAuth())
else routerAdd("GET","/api/data",handler)

})();
