using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class AROverlay : MonoBehaviour
{
    public RawImage cameraFeed;
    public RectTransform overlayParent;
    public GameObject boxPrefab;

    private readonly List<GameObject> _boxes = new();

    // Call this when detection results arrive
    public void UpdateDetections(List<Detection> detections)
    {
        foreach (var box in _boxes) Destroy(box);
        _boxes.Clear();

        foreach (var det in detections)
        {
            var box = Instantiate(boxPrefab, overlayParent);
            box.GetComponentInChildren<Text>().text = det.label;
            var rect = box.GetComponent<RectTransform>();
            rect.anchorMin = new Vector2(det.x1, 1 - det.y2);
            rect.anchorMax = new Vector2(det.x2, 1 - det.y1);
            _boxes.Add(box);
        }
    }
}

public class Detection
{
    public string label;
    public float confidence;
    public float x1, y1, x2, y2; // normalized coords
}
