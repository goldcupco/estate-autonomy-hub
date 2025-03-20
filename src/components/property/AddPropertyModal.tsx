
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property } from '@/pages/Properties';
import { PropertyForm } from './forms/PropertyForm';
import { usePropertyData } from './hooks/usePropertyData';
import { MLSImporter } from './mls';

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyAdded?: (property: Property) => void;
  propertyToEdit?: Property | null;
  onPropertyUpdated?: (property: Property) => void;
}

export function AddPropertyModal({ 
  open, 
  onOpenChange, 
  onPropertyAdded, 
  propertyToEdit,
  onPropertyUpdated 
}: AddPropertyModalProps) {
  const [activeTab, setActiveTab] = useState('manual');
  
  const {
    property,
    isSubmitting,
    isEditMode,
    handleInputChange,
    handleImportSuccess,
    handleSubmit,
    resetProperty
  } = usePropertyData(
    propertyToEdit || null,
    onOpenChange,
    onPropertyAdded,
    onPropertyUpdated
  );

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetProperty();
      setActiveTab('manual');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Property' : 'Add New Property'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update property details' : 'Enter property details manually or import from MLS'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            {!isEditMode && <TabsTrigger value="import">Import from MLS</TabsTrigger>}
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <PropertyForm 
              property={property} 
              handleInputChange={handleInputChange} 
            />
          </TabsContent>

          {!isEditMode && (
            <TabsContent value="import" className="mt-4">
              <MLSImporter onImportSuccess={handleImportSuccess} />
            </TabsContent>
          )}
        </Tabs>

        {activeTab === 'manual' && (
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting 
                ? (isEditMode ? 'Updating...' : 'Adding...') 
                : (isEditMode ? 'Update Property' : 'Add Property')
              }
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
