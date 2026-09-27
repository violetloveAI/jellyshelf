import {Capacitor} from '@capacitor/core';

export function isNativeApp(): boolean { return Capacitor.isNativePlatform(); }

function wasCancelled(error: unknown) {
  const message = error instanceof Error ? error.message : String((error as {message?:string})?.message || error);
  return /user cancel(?:l)?ed|share cancel(?:l)?ed|cancelled by user|canceled by user|用户取消/i.test(message);
}

export async function pickNativePhoto(source: 'camera' | 'photos'): Promise<File | null> {
  if (!isNativeApp()) throw new Error('请使用浏览器的照片选择按钮。');
  const {Camera, CameraResultType, CameraSource} = await import('@capacitor/camera');
  try {
    const photo = await Camera.getPhoto({
      source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
      resultType: CameraResultType.Uri,
      quality: 85, width: 1600, height: 1600,
      correctOrientation: true, saveToGallery: false, allowEditing: false,
    });
    if (!photo.webPath) throw new Error('没有读取到所选照片，请重新选择。');
    const response = await fetch(photo.webPath);
    if (!response.ok) throw new Error('无法读取所选照片，请重新选择。');
    const blob = await response.blob();
    if (blob.size > 8 * 1024 * 1024) throw new Error('处理后的照片仍超过 8 MB，请选择较小的照片。');
    return new File([blob], `jellyshelf-${crypto.randomUUID()}.jpg`, {type: 'image/jpeg'});
  } catch (error) {
    if (wasCancelled(error)) return null;
    const message = error instanceof Error ? error.message : String((error as {message?:string})?.message || '照片读取失败');
    if (/denied|permission|access/i.test(message)) throw new Error('照片或相机权限未开启，可在 iPhone 设置中允许 JellyShelf 访问。');
    throw new Error(message);
  }
}

/** Native Share resolves only after a completed system activity; cancellation is distinct. */
export async function saveBackupFile(blob: Blob, filename: string): Promise<'shared' | 'download-requested' | 'cancelled'> {
  if (!isNativeApp()) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return 'download-requested';
  }
  const {Filesystem, Directory, Encoding} = await import('@capacitor/filesystem');
  const {Share} = await import('@capacitor/share');
  const path = `backups/${crypto.randomUUID()}/${filename}`;
  const {uri} = await Filesystem.writeFile({path, directory: Directory.Cache, data: await blob.text(), encoding: Encoding.UTF8, recursive: true});
  try {
    await Share.share({files: [uri], title: 'JellyShelf 完整备份', dialogTitle: '保存商品与照片备份'});
    return 'shared';
  } catch (error) {
    if (wasCancelled(error)) return 'cancelled';
    throw error;
  } finally {
    // Only this generated temporary copy is removed; original records and photos stay intact.
    await Filesystem.deleteFile({path, directory: Directory.Cache}).catch(() => {});
  }
}
