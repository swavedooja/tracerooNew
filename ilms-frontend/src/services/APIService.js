import { supabase } from './supabaseClient';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const MaterialsAPI = {
  list: async () => {
    const { data, error } = await supabase.from('materials').select('*');
    if (error) throw error;
    return data.map(transformMaterial);
  },
  get: async (code) => {
    const { data, error } = await supabase.from('materials').select('*').eq('code', code).single();
    if (error) throw error;
    return transformMaterial(data);
  },
  create: async (item) => {
    const payload = {
      id: generateUUID(),
      code: item.code,
      name: item.name,
      description: item.description,
      type: item.type,
      category: item.category,
      base_uom: item.baseUom,
      is_batch_managed: item.isBatchManaged,
      is_serial_managed: item.isSerialManaged,
      shelf_life_days: item.shelfLifeDays,
      min_stock: item.minStock,
      max_stock: item.maxStock,
      gross_weight: item.grossWeight,
      net_weight: item.netWeight,
      weight_uom: item.weightUom,
      length: item.length,
      width: item.width,
      height: item.height,
      dimension_uom: item.dimensionUom,
      is_hazmat: item.isHazmat,
      hazmat_class: item.hazmatClass,
      un_number: item.unNumber,
      status: item.status || 'ACTIVE'
    };
    const { data, error } = await supabase.from('materials').insert([payload]).select().single();
    if (error) throw error;
    return transformMaterial(data);
  },
  update: async (code, item) => {
    const payload = {
      name: item.name,
      description: item.description,
      type: item.type,
      category: item.category,
      base_uom: item.baseUom,
      is_batch_managed: item.isBatchManaged,
      is_serial_managed: item.isSerialManaged,
      shelf_life_days: item.shelfLifeDays,
      min_stock: item.minStock,
      max_stock: item.maxStock,
      gross_weight: item.grossWeight,
      net_weight: item.netWeight,
      weight_uom: item.weightUom,
      length: item.length,
      width: item.width,
      height: item.height,
      dimension_uom: item.dimensionUom,
      is_hazmat: item.isHazmat,
      hazmat_class: item.hazmatClass,
      un_number: item.unNumber
    };
    const { data, error } = await supabase.from('materials').update(payload).eq('code', code).select().single();
    if (error) throw error;
    return transformMaterial(data);
  },
  remove: async (code) => {
    const { error } = await supabase.from('materials').delete().eq('code', code);
    if (error) throw error;
  }
};

export const LocationAPI = {
  list: async () => {
    const { data, error } = await supabase.from('locations').select('*');
    if (error) throw error;
    return data.map(transformLocation);
  },
  getTree: async () => {
    const { data, error } = await supabase.from('locations').select('*');
    if (error) throw error;
    return data.map(transformLocation);
  },
  getChildren: async (parentId) => {
    let query = supabase.from('locations').select('*');
    if (parentId === 'root' || !parentId) {
      query = query.is('parent_id', null);
    } else {
      query = query.eq('parent_id', parentId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.map(transformLocation);
  },
  get: async (code) => {
    const { data, error } = await supabase.from('locations').select('*').eq('code', code).single();
    if (error) throw error;
    return transformLocation(data);
  },
  create: async (item) => {
    const payload = {
      id: generateUUID(),
      code: item.code,
      name: item.name,
      type: item.type,
      category: item.category,
      parent_id: item.parentId,
      address_line1: item.address,
      status: 'ACTIVE'
    };
    const { data, error } = await supabase.from('locations').insert([payload]).select().single();
    if (error) throw error;
    return transformLocation(data);
  },
  update: async (code, item) => {
    const payload = {
      name: item.name,
      type: item.type,
      category: item.category,
      parent_id: item.parentId,
      address_line1: item.address
    };
    const { data, error } = await supabase.from('locations').update(payload).eq('code', code).select().single();
    if (error) throw error;
    return transformLocation(data);
  },
  getRoots: async () => {
    const { data, error } = await supabase.from('locations').select('*').is('parent_id', null);
    if (error) throw error;
    return data.map(transformLocation);
  },
};

export const MasterDefinitionsAPI = {
  list: async () => {
    const { data, error } = await supabase.from('master_definitions').select('*');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      defType: d.def_type,
      defValue: d.def_value,
      description: d.description
    }));
  },
  create: async (item) => {
    const { data, error } = await supabase.from('master_definitions').insert([{
      def_type: item.defType,
      def_value: item.defValue,
      description: item.description
    }]).select().single();
    if (error) throw error;
    return data;
  },
  remove: async (id) => {
    const { error } = await supabase.from('master_definitions').delete().eq('id', id);
    if (error) throw error;
  }
};

export const PackagingAPI = {
  getHierarchies: async () => {
    const { data, error } = await supabase.from('packaging_hierarchy').select('*');
    if (error) throw error;
    return data;
  },
  createHierarchy: async (item) => {
    const { data, error } = await supabase.from('packaging_hierarchy').insert([item]).select().single();
    if (error) throw error;
    return data;
  },
  getLevels: async (hierarchyId) => {
    const { data, error } = await supabase.from('packaging_level')
      .select(`*, label_template:label_templates(name)`)
      .eq('hierarchy_id', hierarchyId)
      .order('level_order', { ascending: true });
    if (error) throw error;
    return data;
  },
  createLevel: async (item) => {
    const { data, error } = await supabase.from('packaging_level').insert([item]).select().single();
    if (error) throw error;
    return data;
  },
  updateLevel: async (id, item) => {
    const { data, error } = await supabase.from('packaging_level').update(item).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  deleteLevel: async (id) => {
    const { error } = await supabase.from('packaging_level').delete().eq('id', id);
    if (error) throw error;
  }
};

export const InventoryAPI = {
  list: async () => {
    const { data, error } = await supabase.from('inventory').select(`
            *,
            material:materials(code, name),
            location:locations(code, name)
        `);
    if (error) throw error;
    return data.map(i => ({
      id: i.id,
      materialCode: i.material?.code,
      materialName: i.material?.name,
      serialNumber: i.serial_number,
      batchNumber: i.batch_number,
      status: i.status,
      locationCode: i.location?.code,
      locationName: i.location?.name,
      createdAt: i.created_at
    }));
  },
  create: async (item) => {
    const payload = {
      material_id: item.materialId,
      serial_number: item.serialNumber,
      batch_number: item.batchNumber,
      status: item.status || 'REGISTERED',
      location_id: item.locationId
    };
    const { data, error } = await supabase.from('inventory').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }
};

export const LabelTemplateAPI = {
  list: async () => {
    const { data, error } = await supabase.from('label_templates').select('*');
    if (error) throw error;
    return data;
  },
  get: async (id) => {
    const { data, error } = await supabase.from('label_templates').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (item) => {
    const { data, error } = await supabase.from('label_templates').insert([item]).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id, item) => {
    const { data, error } = await supabase.from('label_templates').update(item).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};

export const TraceAPI = {
  list: async () => {
    const { data, error } = await supabase.from('trace_event').select('*');
    if (error) throw error;
    return data;
  },
  create: async (item) => {
    const { data, error } = await supabase.from('trace_event').insert([item]).select().single();
    if (error) throw error;
    return data;
  }
};

// --- Helpers ---

const transformMaterial = (m) => ({
  id: m.id,
  code: m.code,
  name: m.name,
  description: m.description,
  type: m.type,
  category: m.category,
  baseUom: m.base_uom,
  isBatchManaged: m.is_batch_managed,
  isSerialManaged: m.is_serial_managed,
  shelfLifeDays: m.shelf_life_days,
  minStock: m.min_stock,
  maxStock: m.max_stock,
  grossWeight: m.gross_weight,
  netWeight: m.net_weight,
  weightUom: m.weight_uom,
  length: m.length,
  width: m.width,
  height: m.height,
  dimensionUom: m.dimension_uom,
  isHazmat: m.is_hazmat,
  hazmatClass: m.hazmat_class,
  unNumber: m.un_number,
  status: m.status
});

const transformLocation = (l) => ({
  id: l.id,
  code: l.code,
  name: l.name,
  type: l.type,
  category: l.category,
  parentId: l.parent_id,
  address: l.address_line1,
  status: l.status
});
