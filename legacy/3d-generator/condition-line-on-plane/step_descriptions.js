// Step descriptions for Condition-line-on-plane
export function getAllDescriptions() {
    return {
        'title': 'Verify whether line lies in plane',
        
        // Initial setup
        'plane': 'Plane establishes surface to test line containment',
        
        'line': 'Line $L$ to check for containment in plane',
        
        // Point identification
        'point_on_line': 'Point $P$ on line $L$ extracted for first condition',
        
        // Direction and normal vectors
        'direction_vector': 'Direction $\\vec{d}$ of line $L$ needed for perpendicularity test',
        
        'normal_vector': 'Normal $\\vec{n}$ to plane for checking line orientation',
        
        // Verification checks
        'check_point_on_plane': 'First condition: Point $P$ must satisfy plane equation',
        
        'check_perpendicularity': 'Second condition: $\\vec{d} \\perp \\vec{n}$ required for line in plane',
        
        // Conclusion
        'conclusion': 'Line not in plane: fails perpendicularity condition'
    };
}
