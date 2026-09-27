import {useRef,useState} from 'react';
import {Download,Upload,Check,Loader2,HardDrive,ArrowUpRight} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {exportBackup,inspectBackup,importBackup,type BackupPreview} from '@/lib/local-catalog';
export default function BackupPanel({open,onClose,onRestored}:{open:boolean;onClose:()=>void;onRestored:()=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[preview,setPreview]=useState<BackupPreview|null>(null);
 const [last,setLast]=useState(()=>{try{return localStorage.getItem('jellyshelf:last-export')||'';}catch{return '';}});
 const input=useRef<HTMLInputElement>(null);
 async function download(){setBusy(true);setError('');setNotice('');try{const blob=await exportBackup();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`jellyshelf-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);const date=new Date().toISOString();setLast(date);try{localStorage.setItem('jellyshelf:last-export',date);}catch{}setNotice('备份文件已生成，请保存到“文件”或你自己的网盘。');}catch(e){setError(e instanceof Error?e.message:'备份未完成，请重试。');}finally{setBusy(false);}}
 async function inspect(file?:File){if(!file)return;setBusy(true);setError('');setNotice('');setPreview(null);try{setPreview(await inspectBackup(file));}catch(e){setError(e instanceof Error?e.message:'无法读取备份文件。');}finally{setBusy(false);if(input.current)input.current.value='';}}
 async function restore(){if(!preview)return;setBusy(true);setError('');try{const result=await importBackup(preview);setNotice(`已导入 ${result.added} 款商品，跳过 ${result.skipped} 款已有记录。`);setPreview(null);onRestored();}catch(e){setError(e instanceof Error?e.message:'导入未完成，原资料保留。');}finally{setBusy(false);}}
 return <Dialog open={open} onOpenChange={o=>{if(!o&&!busy)onClose();}}><DialogContent className="backup-dialog"><div className="eyebrow">KEEP YOUR COLLECTION SAFE</div><DialogTitle>把收藏，好好留存。</DialogTitle><DialogDescription>商品资料与照片只保存在当前浏览器，不上传到 GitHub，也不会出现在别人的设备里。</DialogDescription>
 <div className="storage-explainer"><HardDrive size={23}/><div><strong>本机资料库</strong><p>请使用普通浏览模式。清除浏览器数据、换手机或更换浏览器后，需要用备份恢复。建议每次集中录入后导出一次。</p></div></div>
 <Button className="primary-button backup-export" onClick={download} disabled={busy}>{busy?<Loader2 className="spin" size={18}/>:<Download size={18}/>}导出完整备份（含照片）</Button>
 <p className="backup-last">{last?'上次导出：'+new Date(last).toLocaleString('zh-CN'):'还没有导出过备份'}<br/>上传的照片包含在文件中，官网参考图片保留原链接。</p>
 <div className="backup-import"><h3>恢复或合并资料</h3><p>选择 JellyShelf 备份文件，核对数量后再导入。已有同编号商品保留，不会覆盖。</p><input ref={input} hidden type="file" accept="application/json,.json" onChange={e=>inspect(e.target.files?.[0])}/><Button variant="outline" disabled={busy} onClick={()=>input.current?.click()}><Upload size={17}/>选择备份文件</Button></div>
 {preview&&<div className="backup-preview"><strong>{preview.counts.products} 款商品 · {preview.counts.photos} 张照片</strong><p>{preview.filename}</p><Button className="primary-button" disabled={busy} onClick={restore}><Check size={17}/>确认合并到本机资料库</Button></div>}
 {error&&<p className="form-error" role="alert">{error}</p>}{notice&&<p className="backup-notice" role="status">{notice}</p>}
 <a href="https://github.com/violetloveAI/jellyshelf" target="_blank" rel="noreferrer" className="backup-source">查看应用源码 <ArrowUpRight size={14}/></a>
 </DialogContent></Dialog>;
}
