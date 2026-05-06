#!/usr/bin/env python3
"""
Quick test script to verify Indic Parler-TTS installation and functionality
"""

import sys
import json

def test_installation():
    """Test that all required packages are installed."""
    print("Testing Indic Parler-TTS Installation...")
    print("=" * 50)
    
    packages = {
        "torch": "PyTorch",
        "transformers": "Transformers",
        "soundfile": "SoundFile",
        "parler_tts": "Parler-TTS",
        "numpy": "NumPy",
    }
    
    all_installed = True
    for package_name, display_name in packages.items():
        try:
            __import__(package_name)
            print(f"✓ {display_name} is installed")
        except ImportError:
            print(f"✗ {display_name} is NOT installed")
            all_installed = False
    
    print("=" * 50)
    
    if not all_installed:
        print("\nMissing packages detected!")
        print("Please run: pip install git+https://github.com/huggingface/parler-tts.git transformers soundfile")
        return False
    
    print("\n✓ All dependencies are installed!")
    return True


def test_model_loading():
    """Test that the model can be loaded."""
    print("\nTesting Model Loading...")
    print("=" * 50)
    
    try:
        import torch
        from transformers import AutoTokenizer
        from parler_tts import ParlerTTSForConditionalGeneration
        
        device = "cuda:0" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device}")
        
        print("Loading model... (this may take a minute on first run)")
        model = ParlerTTSForConditionalGeneration.from_pretrained(
            "ai4bharat/indic-parler-tts"
        ).to(device)
        print("✓ Model loaded successfully")
        
        print("Loading tokenizers...")
        tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indic-parler-tts")
        description_tokenizer = AutoTokenizer.from_pretrained(
            model.config.text_encoder._name_or_path
        )
        print("✓ Tokenizers loaded successfully")
        
        print(f"Model size: {model.get_parameter('decoder').numel() / 1e6:.1f}M parameters")
        print(f"Sample rate: {model.config.sampling_rate} Hz")
        
        return True, model, tokenizer, description_tokenizer, device
    
    except Exception as e:
        print(f"✗ Error loading model: {str(e)}")
        return False, None, None, None, None


def test_speech_generation():
    """Test that speech can be generated."""
    print("\nTesting Speech Generation...")
    print("=" * 50)
    
    success, model, tokenizer, description_tokenizer, device = test_model_loading()
    
    if not success:
        return False
    
    try:
        import torch
        import soundfile as sf
        
        # Test in Hindi
        text = "नमस्ते, आप कैसे हैं?"
        description = "Divya's voice is clear and expressive with moderate pace and pitch. Very high quality audio."
        
        print(f"Text: {text}")
        print(f"Description: {description}")
        
        description_input_ids = description_tokenizer(
            description, return_tensors="pt"
        ).to(device)
        prompt_input_ids = tokenizer(
            text, return_tensors="pt"
        ).to(device)
        
        print("Generating audio...")
        with torch.no_grad():
            generation = model.generate(
                input_ids=description_input_ids.input_ids,
                attention_mask=description_input_ids.attention_mask,
                prompt_input_ids=prompt_input_ids.input_ids,
                prompt_attention_mask=prompt_input_ids.attention_mask,
                do_sample=False,
            )
        
        audio_arr = generation.cpu().numpy().squeeze()
        
        # Save test audio
        output_file = "test_tts_output.wav"
        sf.write(output_file, audio_arr, model.config.sampling_rate)
        
        print(f"✓ Audio generated successfully ({len(audio_arr)} samples)")
        print(f"✓ Audio saved to {output_file}")
        
        return True
    
    except Exception as e:
        print(f"✗ Error generating speech: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("\n" + "=" * 50)
    print("INDIC PARLER-TTS INSTALLATION TEST")
    print("=" * 50 + "\n")
    
    # Test 1: Installation
    if not test_installation():
        print("\n❌ Installation test failed")
        sys.exit(1)
    
    # Test 2: Speech Generation
    if not test_speech_generation():
        print("\n❌ Speech generation test failed")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("✓ ALL TESTS PASSED!")
    print("=" * 50)
    print("\nYour Indic Parler-TTS setup is ready to use!")
    print("Start the backend with: npm start")
    print("Then test with: curl -X POST http://localhost:3001/api/tts ...")


if __name__ == "__main__":
    main()
