"use client";

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"
import NavBar from '@/components/NavBar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import { Shield, Satellite, Rocket, Plus, Minus, Package } from 'lucide-react';

type Item = {
  id: string;
  name: string;
  quantity: number;
};

const DEFAULT_ITEMS: Omit<Item, 'id'>[] = [
  { name: 'Fire Extinguisher', quantity: 0 },
  { name: 'Toolbox', quantity: 0 },
  { name: 'Oxygen Tank', quantity: 0 }
];

function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('Oxygen Tank');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [removeQuantity, setRemoveQuantity] = useState<number>(1);
  const router = useRouter();
  useEffect(() => {
    fetchItems();
  }, []);
  
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items')
      const data: Item[] = await res.json()

      if (data.length === 0) {
        await Promise.all(
          DEFAULT_ITEMS.map((item) =>
            fetch('/api/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: item.name, quantity: item.quantity })
            })
          )
        )
        const res2 = await fetch('/api/items')
        const inserted: Item[] = await res2.json()
        setItems(inserted)
      } else {
        setItems(data)
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddItem = async () => {
    try {
      // Find the item to update
      const itemToUpdate = items.find(item => item.name === selectedItem);
      
      if (itemToUpdate) {
        const newQuantity = itemToUpdate.quantity + quantity;

        await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: itemToUpdate.id, quantity })
        })

        setItems(items.map(item =>
          item.id === itemToUpdate.id
            ? { ...item, quantity: newQuantity }
            : item
        ));
        toast.success(`Added ${quantity} ${selectedItem}(s) to inventory.`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };
  
  const handleRemoveItem = async (itemId: string, itemName: string) => {
    try {
      // Find the item to update
      const itemToUpdate = items.find(item => item.id === itemId);
      
      if (itemToUpdate && itemToUpdate.quantity > 0) {
        const newQuantity = itemToUpdate.quantity - 1;

        await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: itemId, quantity: -1 })
        })

        setItems(items.map(item =>
          item.id === itemId
            ? { ...item, quantity: newQuantity }
            : item
        ));
        toast.error(`Removed 1 ${itemName} from inventory.`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };
  
  const openItemModal = (item: Item) => {
    setCurrentItem(item);
    setRemoveQuantity(1);
    setIsModalOpen(true);
  };
  
  const handleMultiRemove = async () => {
    if (!currentItem) return;
    
    try {
      // Ensure we don't remove more than available
      const quantityToRemove = Math.min(removeQuantity, currentItem.quantity);
      const newQuantity = currentItem.quantity - quantityToRemove;

      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentItem.id, quantity: -quantityToRemove })
      })

      setItems(items.map(item =>
        item.id === currentItem.id
          ? { ...item, quantity: newQuantity }
          : item
      ));
      toast.error(`Removed ${quantityToRemove} ${currentItem.name}(s) from inventory.`);
      setIsModalOpen(false);
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };
  
  const getItemIcon = (itemName: string) => {
    switch (itemName) {
      case 'Fire Extinguisher':
        return <Shield className="h-5 w-5 text-red-400" />;
      case 'Toolbox':
        return <Satellite className="h-5 w-5 text-blue-400" />;
      case 'Oxygen Tank':
        return <Rocket className="h-5 w-5 text-cyan-400" />;
      default:
        return <Package className="h-5 w-5 text-purple-400" />;
    }
  };
  
  return (
    <>
    <NavBar/>
    <div className="container mx-auto py-25 px-20 star-field">
      <h1 className="text-4xl text-center font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Mission Inventory Control
      </h1>
      
      <div className="flex items-center justify-center gap-4 mb-8 bg-purple-900/20 border border-purple-400/30 rounded-lg p-6">
        <Select
          value={selectedItem}
          onValueChange={setSelectedItem}
        >
          <SelectTrigger className="w-[200px] bg-purple-900/20 border-purple-400/30 text-purple-300">
            <SelectValue placeholder="Select mission item" />
          </SelectTrigger>
          <SelectContent className="bg-purple-900/90 border-purple-400/30">
            {items.map((item) => (
              <SelectItem key={item.id} value={item.name} className="text-purple-300 hover:bg-purple-800/50">
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-24 bg-purple-900/20 border-purple-400/30 text-purple-300"
        />
        
        <Button 
          onClick={handleAddItem} 
          disabled={loading}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 pulse-glow"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add to Mission
        </Button>
      </div>
      
      <div className="px-40">
        <div className="mt-10 px-10 border border-purple-400/30 rounded-lg py-10 bg-purple-900/20 cosmic-border">
      <Table>
        <TableHeader>
              <TableRow className="border-purple-400/20">
                <TableHead className="text-purple-300">Mission Equipment</TableHead>
                <TableHead className="text-purple-300">Quantity</TableHead>
                <TableHead className="text-right text-purple-300">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="border-purple-400/20 hover:bg-purple-900/30">
                  <TableCell className="text-purple-200 flex items-center gap-2">
                    {getItemIcon(item.name)}
                    {item.name}
                  </TableCell>
                  <TableCell className="text-purple-200 font-semibold">
                    {item.quantity}
                  </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        disabled={item.quantity === 0}
                        size="sm"
                        variant="outline"
                        className="border-purple-400/30 text-purple-300 hover:bg-purple-900/20"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                  <Button 
                        onClick={() => openItemModal(item)}
                        disabled={item.quantity === 0}
                    size="sm"
                        variant="outline"
                        className="border-purple-400/30 text-purple-300 hover:bg-purple-900/20"
                  >
                        Remove Multiple
                  </Button>
                    </div>
                </TableCell>
              </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-purple-900/90 border-purple-400/30">
          <DialogHeader>
            <DialogTitle className="text-purple-300">
              Remove {currentItem?.name} from Mission
            </DialogTitle>
            <DialogDescription className="text-purple-200">
              Current quantity: {currentItem?.quantity}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-purple-300">Quantity to remove:</label>
            <Input
              type="number"
              min="1"
              max={currentItem?.quantity}
              value={removeQuantity}
              onChange={(e) => setRemoveQuantity(parseInt(e.target.value) || 1)}
              className="mt-2 bg-purple-900/20 border-purple-400/30 text-purple-300"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-purple-400/30 text-purple-300 hover:bg-purple-900/20"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMultiRemove}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}

export default ItemsPage