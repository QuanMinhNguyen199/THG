/** Validates the JSON subset used by our Payload field definitions, before rendering/building. */
export function validateDocument(document, collection) {
  function fields(value, definitions, path) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path}: expected object`);
    for (const field of definitions) {
      const item = value[field.name];
      const key = `${path}.${field.name}`;
      if (item === undefined || item === null || item === '') {
        if (field.required) throw new Error(`${key}: required`);
        continue;
      }
      switch (field.type) {
        case 'text':
          if (typeof item !== 'string' || (field.required && !item.trim())) throw new Error(`${key}: expected text`);
          if (['href', 'image'].includes(field.name) && !(/^(\/(?!\/)|https?:\/\/|#)/.test(item))) throw new Error(`${key}: expected local path, anchor or HTTP(S) URL`);
          break;
        case 'number':
          if (typeof item !== 'number' || !Number.isFinite(item) || item < (field.min ?? -Infinity) || item > (field.max ?? Infinity)) throw new Error(`${key}: invalid number`);
          if (field.name === 'pad' && !Number.isInteger(item)) throw new Error(`${key}: expected integer`);
          break;
        case 'checkbox':
          if (typeof item !== 'boolean') throw new Error(`${key}: expected boolean`);
          break;
        case 'select':
          if (!field.options.includes(item)) throw new Error(`${key}: invalid option`);
          break;
        case 'array':
        case 'blocks': {
          if (!Array.isArray(item) || item.length < (field.minRows ?? 0)) throw new Error(`${key}: invalid array`);
          const ids = new Set();
          const anchors = new Set();
          item.forEach((row, index) => {
            const rowPath = `${key}[${index}]`;
            if (field.type === 'array') return fields(row, field.fields, rowPath);
            if (!row || typeof row !== 'object') throw new Error(`${rowPath}: expected block`);
            const block = field.blocks.find(candidate => candidate.slug === row.blockType);
            if (!block) throw new Error(`${rowPath}: unknown block type ${row.blockType}`);
            if (typeof row.id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(row.id) || ids.has(row.id)) throw new Error(`${rowPath}: missing, invalid or duplicate block ID`);
            ids.add(row.id);
            const anchor = row.anchor || `block-${row.id}`;
            if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(anchor) || anchors.has(anchor)) throw new Error(`${rowPath}: invalid or duplicate anchor`);
            anchors.add(anchor);
            fields(row, block.fields, rowPath);
          });
          break;
        }
        default: throw new Error(`${key}: unsupported field type ${field.type}`);
      }
    }
  }
  fields(document, collection.fields, collection.slug);
}
