import { useState, useEffect, useRef } from 'react';
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
} from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Checkbox } from 'src/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs";
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import CardBox from 'src/components/shared/CardBox';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useAuth } from 'src/context/auth-context';
import Swal from 'sweetalert2';

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
  sub_title1: string;
  sub_title2: string;
  sub_title3: string;
  description: string;
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

interface ProductUrl {
  link: string;
}

interface Product {
  id: number;
  slug: string;
  image: string;
  status: boolean;
  ordering: number | null;
  translations: Translation[];
  features: Feature[];
  urls?: ProductUrl[];
}

const ProductList = () => {
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [viewLocale, setViewLocale] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Form State
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState(true);
  const [ordering, setOrdering] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [urls, setUrls] = useState<ProductUrl[]>([{ link: '' }]);
  const [translations, setTranslations] = useState<Translation[]>(
    LANGUAGES.map(l => ({ 
      locale: l.code, 
      title: '', 
      sub_title1: '', 
      sub_title2: '', 
      sub_title3: '', 
      description: '' 
    }))
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
    setOrdering('');
    setImageFile(null);
    setPreviewImage(null);
    setUrls([{ link: '' }]);
    setTranslations(LANGUAGES.map(l => ({ 
      locale: l.code, 
      title: '', 
      sub_title1: '', 
      sub_title2: '', 
      sub_title3: '', 
      description: '' 
    })));
    setFeatures([]);
    setEditingProduct(null);
    setSelectedIds([]);
  };

  const handleTranslationChange = (locale: string, field: keyof Translation, value: string) => {
    setTranslations(prev => prev.map(t => t.locale === locale ? { ...t, [field]: value } : t));
    
    // Auto-generate slug from English title
    if (locale === 'en' && field === 'title') {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/--+/g, '-')     // Replace multiple - with single -
        .trim();
      setSlug(generatedSlug);
    }
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

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedIds.length} products. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/products/bulk-delete`, {
          method: 'POST', // Using POST as per common Laravel bulk routes, or DELETE if configured
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json',
            Accept: 'application/json' 
          },
          body: JSON.stringify({ ids: selectedIds, _method: 'DELETE' }),
        });
        const data = await response.json();
        if (data.success) {
          toast.success(data.message || 'Products deleted successfully');
          setSelectedIds([]);
          fetchProducts();
        } else {
          toast.error(data.message || 'Failed to delete products');
        }
      } catch (error) {
        toast.error('Network error during bulk delete');
      }
    }
  };

  const handleSubmit = async (isConfirmed = false) => {
    // Basic Client-side validation for English title
    const enTrans = translations.find(t => t.locale === 'en');
    if (!enTrans || !enTrans.title.trim()) {
      toast.error('English title is required');
      return;
    }

    // Required fields for English
    if (!enTrans.sub_title1.trim()) { toast.error('English Sub Title 1 is required'); return; }
    if (!enTrans.sub_title2.trim()) { toast.error('English Sub Title 2 is required'); return; }
    if (!enTrans.sub_title3.trim()) { toast.error('English Sub Title 3 is required'); return; }
    if (!enTrans.description.trim()) { toast.error('English Description is required'); return; }

    // Validation for Features List (At least one feature with English text)
    if (features.length === 0) {
      toast.error('At least one feature is required');
      return;
    }
    const hasEnFeature = features.some(f => f.translations.find(ft => ft.locale === 'en')?.feature_text.trim());
    if (!hasEnFeature) {
      toast.error('At least one feature must have English text');
      return;
    }

    // Validation for Product Image (Required)
    if (!imageFile && !previewImage) {
      toast.error('Product image is required');
      return;
    }

    // Check for missing optional translations before saving
    if (!isConfirmed) {
      const filledLocales = translations.filter(t => t.title && t.title.trim() !== '').map(t => t.locale);
      const optionalLocales = LANGUAGES.filter(l => l.code !== 'en').map(l => l.code);
      const missing = optionalLocales.filter(l => !filledLocales.includes(l));
      
      if (missing.length > 0) {
        const result = await Swal.fire({
          title: 'Missing Translations',
          text: `You haven't provided translations for: ${missing.join(', ')}. Only English is required. Do you want to save anyway?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, save anyway',
          cancelButtonText: 'No, go back',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            container: 'swal2-top-layer'
          }
        });

        if (result.isConfirmed) {
          handleSubmit(true);
        }
        return;
      }
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('slug', slug);
    formData.append('status', status ? '1' : '0');
    if (ordering) formData.append('ordering', ordering);
    if (imageFile) formData.append('image', imageFile);

    // Append Translations - Only send those with a title (EN is required)
    const validTranslations = translations.filter(t => t.title.trim() !== '');
    validTranslations.forEach((t, i) => {
      formData.append(`translations[${i}][locale]`, t.locale);
      formData.append(`translations[${i}][title]`, t.title);
      formData.append(`translations[${i}][sub_title1]`, t.sub_title1 || '');
      formData.append(`translations[${i}][sub_title2]`, t.sub_title2 || '');
      formData.append(`translations[${i}][sub_title3]`, t.sub_title3 || '');
      formData.append(`translations[${i}][description]`, t.description || '');
    });

    // Append Features - Only send features that have at least one translation with text
    const validFeatures = features.filter(f => f.translations.some(ft => ft.feature_text.trim() !== ''));
    validFeatures.forEach((f, i) => {
      formData.append(`features[${i}][sort_order]`, f.sort_order.toString());
      f.translations.filter(ft => ft.feature_text.trim() !== '').forEach((ft, j) => {
        formData.append(`features[${i}][translations][${j}][locale]`, ft.locale);
        formData.append(`features[${i}][translations][${j}][feature_text]`, ft.feature_text);
      });
    });

    // Append URLs
    urls.forEach((u, i) => {
      if (u.link) {
        formData.append(`urls[${i}][link]`, u.link);
      }
    });

    if (editingProduct) formData.append('_method', 'PUT');

    try {
      const url = editingProduct ? `${API_URL}/products/${editingProduct.id}` : `${API_URL}/products`;
      const response = await fetch(url, {
        method: 'POST', 
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
        // Handle validation errors
        if (data.errors) {
          const firstError = Object.values(data.errors)[0] as string[];
          toast.error(firstError[0] || 'Validation failed');
        } else {
          toast.error(data.message || 'Error saving product');
        }
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
        setOrdering(fullProduct.ordering?.toString() || '');
        setPreviewImage(fullProduct.image);
        setUrls(fullProduct.urls && fullProduct.urls.length > 0 ? fullProduct.urls : [{ link: '' }]);
        
        // Load all 4 language translations
        const existingTrans = fullProduct.translations || [];
        setTranslations(LANGUAGES.map(l => {
          const found = existingTrans.find((t: any) => t.locale === l.code);
          return found ? {
            locale: l.code,
            title: found.title || '',
            sub_title1: found.sub_title1 || '',
            sub_title2: found.sub_title2 || '',
            sub_title3: found.sub_title3 || '',
            description: found.description || ''
          } : { 
            locale: l.code, 
            title: '', 
            sub_title1: '', 
            sub_title2: '', 
            sub_title3: '', 
            description: '' 
          };
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

  const handleView = async (product: Product) => {
    try {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        headers: { Accept: 'application/json' }
      });
      const resData = await response.json();
      if (resData.success) {
        setViewingProduct(resData.data);
        setViewLocale('en');
        setIsViewDialogOpen(true);
      }
    } catch (error) {
      toast.error('Failed to fetch product details');
    }
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You are about to delete this product. This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            toast.success('Product deleted');
            fetchProducts();
          } else {
            toast.error('Delete failed');
          }
        } catch (error) {
          toast.error('Delete failed');
        }
      }
    });
  };

  return (
    <>
      <BreadcrumbComp title="Products" items={BCrumb} />
      <CardBox>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h4 className="text-xl font-bold">Manage Products</h4>
            {selectedIds.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete} 
                className="flex gap-2 animate-in fade-in zoom-in duration-200 bg-red-600 hover:bg-red-700 text-white"
              >
                <Icon icon="solar:trash-bin-trash-bold" width={18} className="text-white" /> 
                <span className="text-white">Delete Selected ({selectedIds.length})</span>
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="flex gap-2">
              <Icon icon="solar:add-circle-linear" width={18} /> Add Product
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={products.length > 0 && selectedIds.length === products.length} 
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[80px]">Order</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Title (EN)</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} className="text-center py-10">Loading...</TableCell></TableRow> : 
                products.map((p) => (
                <TableRow key={p.id} className={selectedIds.includes(p.id) ? 'bg-muted/30' : ''}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(p.id)} 
                      onCheckedChange={() => toggleSelectOne(p.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.ordering ?? '-'}</TableCell>
                  <TableCell>
                    <img 
                      src={p.image ? `${import.meta.env.VITE_STORAGE_URL || ''}/storage/${p.image}` : '/placeholder.png'} 
                      className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity border border-muted" 
                      onClick={() => handleView(p)}
                      title="View Details"
                    />
                  </TableCell>
                  <TableCell className="font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => handleView(p)} title="View Details">
                    {p.translations.find(t => t.locale === 'en')?.title || 'N/A'}
                  </TableCell>
                  <TableCell>{p.slug}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${p.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleView(p)} className="text-info"><Icon icon="solar:eye-linear" width={18} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="text-primary"><Icon icon="solar:pen-new-square-linear" width={18} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive"><Icon icon="solar:trash-bin-trash-linear" width={18} /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardBox>

      {/* View Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-start pr-8">
              <DialogTitle className="text-2xl font-bold">Product Details</DialogTitle>
              <span className={`text-xs px-3 py-1 rounded-full ${viewingProduct?.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {viewingProduct?.status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </DialogHeader>

          {viewingProduct && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6">
              {/* ... (rest of viewingProduct content) ... */}
              <div className="space-y-6">
                <div className="aspect-square rounded-xl overflow-hidden border bg-muted/30">
                  <img 
                    src={viewingProduct.image ? `${import.meta.env.VITE_STORAGE_URL || ''}/storage/${viewingProduct.image}` : '/placeholder.png'} 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Product Slug</Label>
                    <p className="font-medium text-sm break-all">{viewingProduct.slug}</p>
                  </div>
                  {viewingProduct.urls && viewingProduct.urls.length > 0 && (
                    <div>
                      <Label className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Reference Links</Label>
                      <ul className="space-y-1 mt-1">
                        {viewingProduct.urls.map((u, i) => (
                          <li key={i} className="text-sm">
                            <a href={u.link} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                              <Icon icon="solar:link-linear" width={14} /> Link {i + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle & Right Column: Content & Features */}
              <div className="md:col-span-2 space-y-8">
                <Tabs value={viewLocale} onValueChange={setViewLocale}>
                  <TabsList className="grid grid-cols-4 w-full max-w-[400px]">
                    {LANGUAGES.map(l => <TabsTrigger key={l.code} value={l.code}>{l.name}</TabsTrigger>)}
                  </TabsList>
                  {LANGUAGES.map(l => {
                    const trans = viewingProduct.translations.find(t => t.locale === l.code);
                    return (
                      <TabsContent key={l.code} value={l.code} className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {trans ? (
                          <>
                            <div className="space-y-1 border-b pb-4">
                              <h3 className="text-2xl font-bold">{trans.title}</h3>
                              <p className="text-primary font-medium">{trans.sub_title1}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 rounded-lg bg-muted/20 border">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Sub Title 2</Label>
                                <p className="text-sm mt-1">{trans.sub_title2 || 'N/A'}</p>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/20 border">
                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Sub Title 3</Label>
                                <p className="text-sm mt-1">{trans.sub_title3 || 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Description</Label>
                              <p className="text-sm mt-2 text-muted-foreground leading-relaxed whitespace-pre-wrap">{trans.description || 'No description provided.'}</p>
                            </div>
                          </>
                        ) : (
                          <div className="py-10 text-center text-muted-foreground italic border rounded-lg border-dashed">
                            No translation content available for {l.name}.
                          </div>
                        )}
                      </TabsContent>
                    );
                  })}
                </Tabs>

                <div className="space-y-4">
                  <h4 className="font-bold flex items-center gap-2">
                    <Icon icon="solar:checklist-bold" className="text-primary" /> Key Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewingProduct.features.map((f, fi) => {
                      // Get current locale feature text, fallback to English, then first available
                      const featureText = f.translations.find(ft => ft.locale === viewLocale)?.feature_text || 
                                          f.translations.find(ft => ft.locale === 'en')?.feature_text || 
                                          f.translations[0]?.feature_text;
                      return (
                        <div key={fi} className="flex items-start gap-2 p-3 border rounded-lg bg-background hover:border-primary/50 transition-colors group">
                          <Icon icon="solar:check-circle-bold" className="text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm group-hover:text-primary transition-colors">{featureText}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4 gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="flex gap-2">
              <Icon icon="solar:close-circle-linear" width={18} /> Close
            </Button>
            <Button onClick={() => { setIsViewDialogOpen(false); handleEdit(viewingProduct!); }} className="flex gap-2">
              <Icon icon="solar:pen-new-square-linear" width={18} /> Edit Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto" 
          ref={dialogContentRef}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
          
          {/* ... (form content remains the same) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product Image <span className="text-destructive">*</span></Label>
                <div className="relative group">
                  <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50" onClick={() => document.getElementById('p-image')?.click()}>
                    {previewImage ? (
                      <div className="relative">
                        <img src={previewImage.startsWith('blob') ? previewImage : `${import.meta.env.VITE_STORAGE_URL || ''}/storage/${previewImage}`} className="h-32 mx-auto object-contain" />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageFile(null);
                            setPreviewImage(null);
                          }}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" width={14} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Icon icon="solar:upload-linear" width={40} className="mx-auto text-muted-foreground" />
                        <p className="text-xs text-muted-foreground mt-2">Click to upload (JPG, PNG, Max 2MB)</p>
                      </>
                    )}
                  </div>
                </div>
                <input id="p-image" type="file" className="hidden" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setPreviewImage(URL.createObjectURL(e.target.files[0])); } }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slug (Custom URL) <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                  <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="e.g. cloud-hosting-pro" />
                </div>
                <div className="space-y-2">
                  <Label>Order <span className="text-muted-foreground text-xs font-normal">(Sorting)</span></Label>
                  <Input type="number" value={ordering} onChange={e => setOrdering(e.target.value)} placeholder="e.g. 1" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="p-status" checked={status} onChange={e => setStatus(e.target.checked)} className="rounded border-gray-300" />
                <Label htmlFor="p-status">Published / Active</Label>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Product URLs <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
                  <Button size="sm" variant="outline" onClick={() => setUrls([...urls, { link: '' }])} className="flex gap-1">
                    <Icon icon="solar:add-circle-linear" width={14} /> Add URL
                  </Button>
                </div>
                {urls.map((u, ui) => (
                  <div key={ui} className="flex gap-2">
                    <Input placeholder="https://..." value={u.link} onChange={e => {
                      const newUrls = [...urls];
                      newUrls[ui].link = e.target.value;
                      setUrls(newUrls);
                    }} />
                    <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => setUrls(urls.filter((_, i) => i !== ui))} disabled={urls.length === 1 && ui === 0}>
                      <Icon icon="solar:trash-bin-trash-linear" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
              <div className="flex justify-between items-center">
                <Label className="font-bold text-lg">Features List <span className="text-destructive">*</span></Label>
                <Button size="sm" variant="outline" onClick={addFeature} className="flex gap-1">
                  <Icon icon="solar:add-circle-linear" width={14} /> Add Feature
                </Button>
              </div>
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
                          <Input size={1} placeholder={`Feature in ${l.name}${l.code === 'en' ? ' (Required)' : ' (Optional)'}`} value={f.translations.find(ft => ft.locale === l.code)?.feature_text || ''} onChange={e => handleFeatureChange(fi, l.code, e.target.value)} />
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
                const isEn = l.code === 'en';
                const optionalLabel = !isEn ? <span className="text-muted-foreground text-xs font-normal"> (Optional)</span> : <span className="text-destructive">*</span>;
                return (
                  <TabsContent key={l.code} value={l.code} className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Title ({l.name}) {optionalLabel}</Label><Input value={trans.title} onChange={e => handleTranslationChange(l.code, 'title', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Sub Title 1 ({l.name}) {optionalLabel}</Label><Input value={trans.sub_title1} onChange={e => handleTranslationChange(l.code, 'sub_title1', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Sub Title 2 ({l.name}) {optionalLabel}</Label><Input value={trans.sub_title2} onChange={e => handleTranslationChange(l.code, 'sub_title2', e.target.value)} /></div>
                      <div className="space-y-2"><Label>Sub Title 3 ({l.name}) {optionalLabel}</Label><Input value={trans.sub_title3} onChange={e => handleTranslationChange(l.code, 'sub_title3', e.target.value)} /></div>
                    </div>
                    <div className="space-y-2"><Label>Description ({l.name}) {optionalLabel}</Label><Textarea rows={4} value={trans.description} onChange={e => handleTranslationChange(l.code, 'description', e.target.value)} /></div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex gap-2">
              <Icon icon="solar:close-circle-linear" width={18} /> Cancel
            </Button>
            <Button onClick={() => handleSubmit()} disabled={isSubmitting} className="flex gap-2">
              <Icon icon="solar:diskette-linear" width={18} /> {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductList;
