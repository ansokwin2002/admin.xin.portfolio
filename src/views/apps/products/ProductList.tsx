import React, { useState } from 'react';
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
  DialogTrigger,
  DialogFooter,
} from 'src/components/ui/dialog';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import BreadcrumbComp from 'src/layouts/full/shared/breadcrumb/BreadcrumbComp';
import CardBox from 'src/components/shared/CardBox';

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Products',
  },
];

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'iPhone 13 Pro', category: 'Electronics', price: '$999' },
    { id: 2, name: 'MacBook Air M2', category: 'Electronics', price: '$1199' },
    { id: 3, name: 'AirPods Pro', category: 'Accessories', price: '$249' },
  ]);

  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '' });
  const [open, setOpen] = useState(false);

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.category && newProduct.price) {
      setProducts([...products, { ...newProduct, id: products.length + 1 }]);
      setNewProduct({ name: '', category: '', price: '' });
      setOpen(false);
    }
  };

  return (
    <>
      <BreadcrumbComp title="Products" items={BCrumb} />
      <CardBox>
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-lg font-semibold">Product List</h4>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct}>Save Product</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBox>
    </>
  );
};

export default ProductList;
