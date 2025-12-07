import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemButton, ListItemText, Collapse, IconButton, CircularProgress } from '@mui/material';
import { ExpandLess, ExpandMore, ChevronRight } from '@mui/icons-material';
import { LocationAPI } from '../../services/APIService';

function LocationTreeItem({ node, onSelect, selectedCode, level = 0 }) {
    const [expanded, setExpanded] = useState(false);
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const handleExpand = async (e) => {
        e.stopPropagation();
        if (expanded) {
            setExpanded(false);
        } else {
            setExpanded(true);
            if (!loaded) {
                setLoading(true);
                try {
                    const data = await LocationAPI.getChildren(node.id);
                    setChildren(data);
                    setLoaded(true);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const handleSelect = () => {
        if (onSelect) onSelect(node.code);
    };

    return (
        <>
            <ListItem disablePadding sx={{ pl: level * 2 }}>
                <ListItemButton selected={selectedCode === node.code} onClick={handleSelect}>
                    <IconButton size="small" onClick={handleExpand} sx={{ mr: 1 }}>
                        {loading ? <CircularProgress size={16} /> : (expanded ? <ExpandLess /> : <ChevronRight />)}
                    </IconButton>
                    <ListItemText primary={node.name} secondary={node.type} />
                </ListItemButton>
            </ListItem>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {children.map(child => (
                        <LocationTreeItem key={child.code} node={child} onSelect={onSelect} selectedCode={selectedCode} level={level + 1} />
                    ))}
                    {loaded && children.length === 0 && (
                        <ListItem sx={{ pl: (level + 1) * 2 + 4 }}>
                            <ListItemText primary="No sub-locations" primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }} />
                        </ListItem>
                    )}
                </List>
            </Collapse>
        </>
    );
}

export default function LocationTreeView({ onSelect, selectedCode }) {
    const [roots, setRoots] = useState([]);

    useEffect(() => {
        loadRoots();
    }, []);

    const loadRoots = async () => {
        try {
            const data = await LocationAPI.getRoots();
            setRoots(data);
        } catch (e) { console.error(e); }
    };

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {roots.map(node => (
                <LocationTreeItem key={node.code} node={node} onSelect={onSelect} selectedCode={selectedCode} />
            ))}
        </List>
    );
}
