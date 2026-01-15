---
title: "Unity Blog Notes"
date: "2023-06-06"
tags: ["Unity", "C#"]
excerpt: "Unity Blog Notes"
---

# Unity Notes (A Summary of the Learning Process)

This post is an English “blog-style” rewrite of the original Unity notes, with **all code snippets fully included** (and with missing `using` statements added so the C# scripts compile).

---

## 1) Common Unity Types

* **GameObject**: A scene object that has a Transform and can hold multiple components.
* **Transform**: Stores position, rotation, and scale.
* **Component**: Base class for attachable functionality.
* **MonoBehaviour**: Base class for gameplay scripts that run in the Unity lifecycle.
* **Vector2 / Vector3**: 2D / 3D vector types.
* **Quaternion**: Rotation representation (often created from Euler angles).
* **Color**: RGBA color.
* **Material**: Rendering properties for a surface.
* **Texture**: Image data for rendering.
* **Animator**: Controls animations.
* **AudioSource**: Plays audio.

---

## 2) Common Unity Methods

* `GameObject.Find()` — find an object by name.
* `GameObject.AddComponent()` — attach a component.
* `GameObject.SetActive()` — enable/disable a GameObject.
* `Transform.Translate()` — move in world/local space.
* `Transform.Rotate()` — rotate in world/local space.
* `Transform.localScale` — set scaling.
* `Time.deltaTime` — time elapsed since last frame.
* `Input.GetKey()` — check key state.
* `Physics.Raycast()` — raycast collision checks.
* `Instantiate()` — spawn/clone an object.
* `Destroy()` — remove an object.
* `Debug.Log()` — print debug info.

---

## 3) Quick Editor Notes

* **Pivot vs Center**: Changes where the gizmo appears; parent/child hierarchies can make pivot behavior feel different.
* **Local vs Global**: Local uses the object’s axes; Global uses world axes.

---

## 4) Scene View Shortcuts

* **Ctrl/Cmd + Alt + F**: Move/focus the Scene view camera.
* **Ctrl/Cmd + Shift + F**: Align the selected object to the current view.
* **Shift + F** (or double-tap **F**): Lock the Scene view camera to the selected GameObject.

---

## 5) Prefabs Workflow Notes

* **Open**: Enter Prefab Mode.
* **Select**: Highlight the prefab in the Project window.
* **Overrides**: Revert instance changes or apply instance changes back to the prefab (note: deleting parts of an instance may not be recoverable).
* Right click → **Export Package** to export.
* Changes made in **Play Mode** are not saved after exiting Play Mode.
* If a script inherits **MonoBehaviour**, the **C# file name must match the class name**, otherwise Unity cannot add it as a component.

---

# 6) Common Techniques (with complete code)

## A) Event system (decoupled communication)

This pattern avoids tight coupling: scripts “listen” for events by name, and other scripts “trigger” those events.

### Complete script (with `using` lines)

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

//Event Manager

public class EventManager : MonoBehaviour
{
    private Dictionary<string, UnityEvent> events = new Dictionary<string, UnityEvent>();

    //AddListener-RegisterEvent 
    //RemoveListener-RemoveEvent
    //TriggerEvent-EventRequest/Call/Invoke

    public static EventManager instance;
    void Awake()
    {
        if(instance == null)
        {
            instance = this;
        }
    }

    public void AddListener(string eventName, UnityAction listener)
    {
        UnityEvent thisEvent = null;
        if(events.TryGetValue(eventName, out thisEvent))
        {
            thisEvent.AddListener(listener);
        }else
        {
            thisEvent = new UnityEvent();
            thisEvent.AddListener(listener);
            events.Add(eventName, thisEvent);
        }
    }

    public void RemoveListener(string eventName, UnityAction listener)
    {
        UnityEvent thisEvent = null;
        if(events.TryGetValue(eventName, out thisEvent))
        {
            thisEvent.RemoveListener(listener);
        }else
        {
            Debug.LogError("Event not found: " + eventName);
        }
    }

    public void TriggerEvent(string eventName)
    {
        UnityEvent thisEvent = null;
        if(events.TryGetValue(eventName, out thisEvent))
        {
            thisEvent.Invoke();
        }else
        {
            Debug.LogError("Event not found: " + eventName);
        }
    }
}
```

---

## B) Properties to encapsulate fields (example: Health clamping)

Properties can validate data and trigger logic when values cross thresholds.

```csharp
using UnityEngine;

//PlayerHealth

public class PlayerHealth : MonoBehaviour
{
    [SerializeField]
    private float health;

    public float Health
    {
        get { return health; }
        set
        {
            health = value;
            if (health <= 0)
            {
                Die();
            }

            if (health > 100)
            {
                health = 100;
            }
        }
    }

    void Die()
    {
        Debug.Log("Player died");
    }
}
```

---

## C) Enums to represent states (example: enemy state machine)

Enums prevent “magic numbers” and keep logic readable.

Original example:

```csharp
using UnityEngine;

public class Enemy : MonoBehaviour
{
    public enum EnemyState
    {
        Idle,
        Chase,
        Attack,
        Dead
    }

    public EnemyState currentState = EnemyState.Idle;

    void Update()
    {
        switch (currentState)
        {
            case EnemyState.Idle:
                //Idle
                break;
            case EnemyState.Chase:
                //Chase
                break;
            case EnemyState.Attack:
                //Attack
                break;
            case EnemyState.Dead:
                //Dead
                break;
        }
    }
}
```

A slightly more “filled in” version (still simple and beginner-friendly):

```csharp
using UnityEngine;

public class EnemySimpleFSM : MonoBehaviour
{
    public enum State { Idle, Chase, Attack, Dead }
    public State currentState = State.Idle;

    public Transform target;
    public float chaseSpeed = 2f;
    public float attackRange = 1.2f;
    public float attackCooldown = 1.0f;

    private float nextAttackTime;

    void Update()
    {
        if (currentState == State.Dead) return;
        if (target == null) { currentState = State.Idle; return; }

        float dist = Vector2.Distance(transform.position, target.position);

        if (dist <= attackRange) currentState = State.Attack;
        else currentState = State.Chase;

        switch (currentState)
        {
            case State.Idle:
                // Stand still / play idle animation
                break;

            case State.Chase:
                Vector3 dir = (target.position - transform.position).normalized;
                transform.position += dir * chaseSpeed * Time.deltaTime;
                break;

            case State.Attack:
                if (Time.time >= nextAttackTime)
                {
                    nextAttackTime = Time.time + attackCooldown;
                    // Replace with real damage logic / animation event
                    Debug.Log("Enemy attacks!");
                }
                break;
        }
    }

    public void Kill()
    {
        currentState = State.Dead;
        // Disable colliders, play death animation, etc.
        gameObject.SetActive(false);
    }
}
```

---

## D) Coroutines (multi-frame logic and timing)

Coroutines are useful for delays and step-by-step sequences without complex callback chains.

```csharp
using System.Collections;
using UnityEngine;

//PlayerCoroutine

public class PlayerCoroutine : MonoBehaviour
{
    void Start()
    {
        StartCoroutine(Jump());
    }

    IEnumerator Jump()
    {
        Debug.Log("Jump start");
        yield return new WaitForSeconds(1);
        Debug.Log("Jump end");
    }
}
```

---

## E) Physics (ground checks + stable movement)

Use physics APIs to get more reliable movement/collision behavior.

```csharp
using UnityEngine;

//PlayerPhysics

public class PlayerPhysics : MonoBehaviour
{
    public float speed = 5f;
    public float jumpForce = 5f;
    public LayerMask groundLayer;
    public Transform groundCheck;
    public float groundCheckRadius = 0.2f;

    private Rigidbody2D rb;
    private bool isGrounded;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    void Update()
    {
        isGrounded = Physics2D.OverlapCircle(groundCheck.position, groundCheckRadius, groundLayer);
        if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
        {
            rb.velocity = new Vector2(rb.velocity.x, jumpForce);
        }
    }

    void FixedUpdate()
    {
        float move = Input.GetAxis("Horizontal");
        rb.velocity = new Vector2(move * speed, rb.velocity.y);
    }
}
```

---

## F) Particle systems (VFX triggers)

```csharp
using UnityEngine;

//ParticleController

public class ParticleController : MonoBehaviour
{
    public ParticleSystem particleSystem;

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            particleSystem.Play();
        }
    }
}
```

---

# 7) Shaders (ShaderLab / Surface Shader examples)

## A) Transparent shader example (as in the notes)

```csharp
Shader "Custom/TransparentShader"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)
        _MainTex ("Albedo (RGB)", 2D) = "white" {}
        _Glossiness ("Smoothness", Range(0,1)) = 0.5
        _Metallic ("Metallic", Range(0,1)) = 0.0
    }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" }
        LOD 200

        CGPROGRAM
        #pragma surface surf Standard alpha

        struct Input
        {
            float2 uv_MainTex;
        };

        sampler2D _MainTex;
        fixed4 _Color;
        half _Glossiness;
        half _Metallic;

        void surf (Input IN, inout SurfaceOutputStandard o)
        {
            fixed4 c = tex2D(_MainTex, IN.uv_MainTex) * _Color;
            o.Albedo = c.rgb;
            o.Metallic = _Metallic;
            o.Smoothness = _Glossiness;
            o.Alpha = c.a;
        }
        ENDCG
    }
    FallBack "Diffuse"
}
```

Note: in production, Transparent shaders often use `RenderType` = `Transparent` and a surface pragma with alpha (`alpha:fade` / `alpha:premul`) depending on the intended blending.

## B) “Preprocessor” / debug note

The notes include this example:

```csharp
//Debugging Shaders Example
Shader "Custom/DebugShader"
{
    CGPROGRAM
    #pragma surface surf Standard

    void surf (Input IN, inout SurfaceOutputStandard o)
    {
        #if DEBUG_MODE
        Debug.Log("Debug mode enabled");
        #endif
    }
    ENDCG
}
```

Important practical note: shader code can use `#if` for conditional compilation, but it cannot call C# APIs like `Debug.Log`. A common alternative is to compile optional “debug views” via keywords.

Here is a working keyword-based example you can use:

```csharp
Shader "Custom/DebugKeywordShader"
{
    Properties
    {
        _Color ("Color", Color) = (1,1,1,1)
        _MainTex ("Albedo (RGB)", 2D) = "white" {}
        _Glossiness ("Smoothness", Range(0,1)) = 0.5
        _Metallic ("Metallic", Range(0,1)) = 0.0
    }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" }
        LOD 200

        CGPROGRAM
        #pragma surface surf Standard alpha:fade
        #pragma multi_compile __ DEBUG_VIEW

        struct Input { float2 uv_MainTex; };

        sampler2D _MainTex;
        float4 _Color;
        float _Glossiness;
        float _Metallic;

        void surf (Input IN, inout SurfaceOutputStandard o)
        {
            fixed4 c = _Color;
            o.Albedo = c.rgb;
            o.Metallic = _Metallic;
            o.Smoothness = _Glossiness;
            o.Alpha = c.a;

            #ifdef DEBUG_VIEW
            // Example debug view: show albedo as a constant value
            o.Albedo = float3(1, 0, 1);
            #endif
        }
        ENDCG
    }
    FallBack "Diffuse"
}
```

To enable it at runtime (example):

```csharp
// material.EnableKeyword("DEBUG_VIEW");
// material.DisableKeyword("DEBUG_VIEW");
```

---

# 8) Shader-writing habits (from the notes)

* Use comments to explain intent and any “gotchas”.
* Give meaningful variable and function names.
* Use macros and preprocessor directives for reuse and conditional compilation.
* Use multiple SubShaders / Passes to support platforms and quality levels.
* Use LOD to manage performance vs quality.
* Use Properties to expose configurable material parameters.
* Use SubShader + Fallback for compatibility and graceful degradation.

---

# 9) “Large project” coding tips (from the referenced video notes)

* Prefer `[SerializeField]` instead of making everything public, so fields are exposed in the Inspector without being publicly writable.
* Keep a component-based architecture: one system per script, so features stay modular and removable.
* Use `[RequireComponent]` to guarantee dependencies.
* Enums work well for closed sets of options and Inspector dropdowns.
* Coroutines are best for tasks that run over multiple frames or for procedural sequences.
* Structs are value types; classes are reference types. Use structs for small, immutable data when appropriate.
* Serializable structs make it easier to edit custom data lists in the Inspector.
* Singleton patterns can help for “one instance” managers.
* Static members belong to the class and are accessible globally, but static methods cannot access instance members directly.

---

# 10) Topics for further study (mentioned in the notes)

* Multithreading vs coroutines
* DoTween
* Raycasts
* Reflection
* Optimization
* Unity rendering pipelines
* Common development “tricks”
