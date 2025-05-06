'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { createFlow } from '@/lib/flows';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getModels } from '@/lib/models';
import { getPrompts } from '@/lib/prompts';

export default function NewFlowPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [models, setModels] = useState([]);
  const [userPrompts, setUserPrompts] = useState([]);
  const [flowData, setFlowData] = useState({
    title: '',
    description: '',
    visibility: 'private',
    tags: [] as string[],
    tagInput: '',
    steps: [{
      id: `step-${Date.now()}`,
      name: 'Step 1',
      modelId: '',
      