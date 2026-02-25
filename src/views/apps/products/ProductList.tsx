import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from 'src/context/auth-context';

const BCrumb = [{ to: '/', title: 'Home' }, { title: 'Products' }];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'kh', name: 'Khmer' },
  { code: 'zh', name: 'Chinese' },
  { code: 'tw', name: 'Taiwanese' }
];

interface Translation {
  locale: string;
  title: string;
  subtitle: string;
  description: string;
  highlight_text: string;
}

interface FeatureTranslation {
  locale: string;
  feature_text: string;
}

interface Feature {
  id?: number;
  sort_order: number;
  translations: FeatureTranslation[];
}

interface Product {
  id: number;
  slug: string;
  image: string;
  status: boolean;
  translations: Translation[];
  features: Feature[];
}

const ProductList = () => {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Translation[]>(
    LANGUAGES.map(l => ({ locale: l.code, title: '', subtitle: '', description: '', highlight_text: '' }))
  );
  const [features, setFeatures] = useState<Feature[]>([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/products?locale=en`);
      const data = await response.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setSlug('');
    setStatus(true);
    setImageFile(null);
    setPreviewImage(null);
    setTranslations(LANGUAGES.map(l => ({ locale: l.code, title: '', subtitle: '', description: '', highlight_text: '' })));
    setFeatures([]);
    setEditingProduct(null);
  };

  const handleTranslationChange = (locale: string, field: keyof Translation, value: string) => {
    setTranslations(prev => prev.map(t => t.locale === locale ? { ...t, [field]: value } : t));
  };

  const addFeature = () => {
    setFeatures([...features, {
      sort_order: features.length,
      translations: LANGUAGES.map(l => ({ locale: l.code, feature_text: '' }))
    }]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (fIndex: number, locale: string, value: string) => {
    const newFeatures = [...features];
    newFeatures[fIndex].translations = newFeatures[fIndex].translations.map(t => 
      t.locale === locale ? { ...t, feature_text: value } : t
    );
    setFeatures(newFeatures);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('slug', slug);
    formData.append('status', status ? '1' : '0');
    if (imageFile) formData.append('image', imageFile);

    // Append Translations
    translations.forEach((t, i) => {
      formData.append(`translations[${i}][locale]`, t.locale);
      formData.append(`translations[${i}][title]`, t.title);
      formData.append(`translations[${i}][subtitle]`, t.subtitle);
      formData.append(`translations[${i}][description]`, t.description);
      formData.append(`translations[${i}][highlight_text]`, t.highlight_text);
    });

    // Append Features
    features.forEach((f, i) => {
      formData.append(`features[${i}][sort_order]`, f.sort_order.toString());
      f.translations.forEach((ft, j) => {
        formData.append(`features[${i}][translations][${j}][locale]`, ft.locale);
        formData.append(`features[${i}][translations][${j}][feature_text]`, ft.feature_text);
      });
    });

    if (editingProduct) formData.append('_method', 'PUT');

    try {
      const url = editingProduct ? `${API_URL}/products/${editingProduct.id}` : `${API_URL}/products`;
      const response = await fetch(url, {
        method: 'POST', // Use POST with _method=PUT for file uploads
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingProduct ? 'Product updated' : 'Product created');
        setIsDialogOpen(false);
        resetForm();
        fetchProducts();
      } else {
        toast.error('Error saving product');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (product: Product) => {
    try {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      });
      const resData = await response.json();
      
      if (resData.success) {
        const fullProduct = resData.data;
        setEditingProduct(fullProduct);
        setSlug(fullProduct.slug);
        setStatus(fullProduct.status);
        setPreviewImage(fullProduct.image);
        
        // Load all 4 language translations
        const existingTrans = fullProduct.translations || [];
        setTranslations(LANGUAGES.map(l => {
          const found = existingTrans.find((t: any) => t.locale === l.code);
          return found ? {
            locale: l.code,
            title: found.title || '',
            subtitle: found.subtitle || '',
            description: found.description || '',
            highlight_text: found.highlight_text || ''
          } : { locale: l.code, title: '', subtitle: '', description: '', highlight_text: '' };
        }));

        // Load features with all translations
        const existingFeatures = fullProduct.features || [];
        setFeatures(existingFeatures.map((f: any) => ({
          id: f.id,
          sort_order: f.sort_order,
          translations: LANGUAGES.map(l => {
            const fFound = f.translations?.find((ft: any) => ft.locale === l.code);
            return fFound ? { locale: l.code, feature_text: fFound.feature_text || '' } : { locale: l.code, feature_text: '' };
          })
        })));

        setIsDialogOpen(true);
      } else {
        toast.error('Failed to load product details');
      }
    } catch (error) {
      toast.error('Error fetching product data');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch(`${API_URL}/products/${productToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Product deleted');
        setIsDeleteDialogOpen(false);
        fetchProducts();
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <>
      <BreadcrumbComp title="Products" items={BCrumb} />
      <CardBox>
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-bold">Manage Products</h4>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="flex gap-2">
            <Icon icon="solar:add-circle-linear" width={18} /> Add Product
          </Button>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title (EN)</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow> : 
                products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <img src={p.image ? `${import.meta.env.VITE_STORAGE_URL || ''}/storage/${p.image}` : '/placeholder.png'} className="w-12 h-12 object-cover rounded" />
                  </TableCell>
                  <TableCell className="font-medium">{p.translations.find(t => t.locale === 'en')?.title || 'N/A'}</TableCell>
                  <TableCell>{p.slug}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${p.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="text-primary"><Icon icon="solar:pen-new-square-linear" width={18} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { setProductToDelete(p.id); setIsDeleteDialogOpen(true); }} className="text-destructive"><Icon icon="solar:trash-bin-trash-linear" width={18} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardBox>

      {/* Main Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50" onClick={() => document.getElementById('p-image')?.click()}>
                  {previewImage ? <img src={previewImage.startsWith('blob') ? previewImage : `${import.meta.env.VITE_STORAGE_URL || ''}/storage/${previewImage}`} className="h-32 mx-auto object-contain" /> : <Icon icon="solar:upload-linear" width={40} className="mx-auto text-muted-foreground" />}
                  <p className="text-xs text-muted-foreground mt-2">Click to upload (JPG, PNG, Max 2MB)</p>
                </div>
                <input id="p-image" type="file" className="hidden" onChange={(e) => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setPreviewImage(URL.createObjectURL(e.target.files[0])); } }} />
              </div>
              <div className="space-y-2">
                <Label>Slug (Custom URL)</Label>
                <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. cloud-hosting-pro" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="p-status" checked={status} onChange={e => setStatus(e.target.checked)} className="rounded border-gray-300" />
                <Label htmlFor="p-status">Published / Active</Label>
              </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
              <div className="flex justify-between items-center"><Label className="font-bold text-lg">Features List</Label><Button size="sm" variant="outline" onClick={addFeature}>+ Add Feature</Button></div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {features.map((f, fi) => (
                  <div key={fi} className="p-3 border rounded relative bg-background">
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => removeFeature(fi)}><Icon icon="solar:close-circle-linear" /></Button>
                    <Tabs defaultValue="en">
                      <TabsList className="h-8 mb-2">
                        {LANGUAGES.map(l => <TabsTrigger key={l.code} value={l.code} className="text-[10px] px-2">{l.name}</TabsTrigger>)}
                      </TabsList>
                      {LANGUAGES.map(l => (
                        <TabsContent key={l.code} value={l.code}>
                          <Input size={1} placeholder={`Feature in ${l.name}`} value={f.translations.find(ft => ft.locale === l.code)?.feature_text || ''} onChange={e => handleFeatureChange(fi, l.code, e.target.value)} />
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-lg font-bold mb-4 block">Product Content (Translations)</Label>
            <Tabs defaultValue="en" className="w-full">
              <TabsList className="grid grid-cols-4 w-full md:w-[400px] mb-6">
                {LANGUAGES.map(l => <TabsTrigger key={l.code} value={l.code}>{l.name}</TabsTrigger>)}
              </TabsList>
              {LANGUAGES.map(l => {
                const trans = translations.find(t => t.locale === l.code)!;
                return (
                  <TabsContent key={l.code} value={l.code} className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Title ({l.name})</Label><Input value={trans.title} onChange={e => handleTranslationChange(l.code, 'title', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Subtitle ({l.name})</Label><Input value={trans.subtitle} onChange={e => handleTranslationChange(l.code, 'subtitle', e.target.value)} /></div>
                    </div>
                    <div className="space-y-2"><Label>Highlight Text ({l.name})</Label><Input value={trans.highlight_text} onChange={e => handleTranslationChange(l.code, 'highlight_text', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Description ({l.name})</Label><Textarea rows={4} value={trans.description} onChange={e => handleTranslationChange(l.code, 'description', e.target.value)} /></div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Product'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle className="text-destructive flex items-center gap-2"><Icon icon="solar:danger-triangle-linear" width={24} /> Confirm Delete</DialogTitle></DialogHeader>
          <p className="py-4 text-muted-foreground text-sm">Are you sure you want to delete this product? All translations and features will be removed.</p>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete Now</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductList;
