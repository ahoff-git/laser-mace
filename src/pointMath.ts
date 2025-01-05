import { Point } from "./commonTypes";

export function dist(obj1: Point, obj2:Point) {
    return Math.sqrt((obj2.x - obj1.x) * (obj2.x - obj1.x) + (obj2.y - obj1.y) * (obj2.y - obj1.y));
}

export function sumOfDistances(points: Point[]){
    let totalDistance = 0;
    
    for (let i = 0; i < points.length - 1; i++) {
        totalDistance += dist(points[i], points[i + 1]);
    }
    
    return totalDistance;
}